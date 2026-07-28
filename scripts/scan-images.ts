import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createWorker } from 'tesseract.js';
import type {
  ExtractionReport,
  ProcessingProgress,
  QuizOption,
  QuizQuestion,
  StudyMaterial
} from '../src/types/swr302';
import { cleanQuestionText } from '../src/utils/textCleanup';

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, 'input-images');
const PUBLIC_INPUT_DIR = path.join(ROOT, 'public', 'input-images');
const DATA_DIR = path.join(ROOT, 'data');
const SRC_DATA_DIR = path.join(ROOT, 'src', 'data');
const PROGRESS_PATH = path.join(DATA_DIR, 'processing-progress.json');
const REPORT_PATH = path.join(DATA_DIR, 'extraction-report.json');
const MATERIALS_PATH = path.join(SRC_DATA_DIR, 'swr302-materials.json');
const QUESTIONS_PATH = path.join(SRC_DATA_DIR, 'swr302-questions.json');
const EXPECTED_IMAGES = 439;
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 15);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

type OcrResult = {
  text: string;
  confidence: number;
};

type ExtractedImage = {
  file: string;
  material: StudyMaterial | null;
  question: QuizQuestion | null;
  failed: boolean;
  needsReview: boolean;
};

type OcrWorker = Awaited<ReturnType<typeof createWorker>>;
let worker: OcrWorker | null = null;

function defaultProgress(totalImages = EXPECTED_IMAGES): ProcessingProgress {
  return {
    totalImages,
    processedImages: 0,
    successfulImages: [],
    failedImages: [],
    duplicateImages: [],
    needsReviewImages: [],
    lastProcessedFile: null,
    completed: false
  };
}

function defaultReport(): ExtractionReport {
  return {
    expectedImages: EXPECTED_IMAGES,
    discoveredImages: 0,
    processedImages: 0,
    successfulImages: 0,
    failedImages: [],
    totalStudyMaterials: 0,
    totalExtractedQuestions: 0,
    validQuizQuestions: 0,
    questionsWithoutCorrectAnswer: 0,
    questionsNeedingReview: 0,
    duplicateQuestionsRemoved: 0,
    completed: false
  };
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function discoverImages() {
  const files = await readdir(INPUT_DIR);
  return files
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

async function mirrorImagesToPublic(images: string[]) {
  await mkdir(PUBLIC_INPUT_DIR, { recursive: true });
  for (const image of images) {
    const src = path.join(INPUT_DIR, image);
    const dest = path.join(PUBLIC_INPUT_DIR, image);
    if (!existsSync(dest)) {
      await copyFile(src, dest);
    }
  }
}

function normalizeOcrText(text: string) {
  return text
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeForDuplicate(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function detectChapter(lines: string[]) {
  const hit = lines.find((line) => /\b(chapter|module|lesson|topic|unit)\b/i.test(line));
  return hit ?? '';
}

function detectTopic(lines: string[]) {
  const hit = lines.find((line) => /\b(requirement|testing|validation|prototype|scope|business|model|quality)\b/i.test(line));
  return hit ?? '';
}

function titleFromLines(lines: string[], fallback: string) {
  return lines.find((line) => line.length >= 4 && line.length <= 120) ?? fallback;
}

function parseExplicitCorrectOptions(lines: string[]) {
  for (const line of lines) {
    const clean = line.replace(/[()[\]{}]/g, ' ');
    const answerMatch =
      clean.match(/\bcorrect\s+answer\s*[:\-]?\s*([A-H](?:[\s,.;/+&]*(?:and|và)?[\s,.;/+&]*[A-H])*)\b/i) ??
      clean.match(/\banswer\s*[:\-]?\s*([A-H](?:[\s,.;/+&]*(?:and|và)?[\s,.;/+&]*[A-H])*)\b/i) ??
      clean.match(/\bđáp\s*án\s*[:\-]?\s*([A-H])\b/i);
    if (answerMatch?.[1]) return Array.from(new Set(answerMatch[1].toUpperCase().match(/[A-H]/g) ?? []));
  }
  return [];
}

function getCorrectOptionIds(question: QuizQuestion) {
  return question.correctOptionIds?.length
    ? question.correctOptionIds
    : question.correctOptionId
      ? [question.correctOptionId]
      : [];
}

function parseQuestion(text: string, sourceImage: string, index: number): QuizQuestion | null {
  const lines = getLines(text);
  const optionMatches: Array<{ label: string; text: string; lineIndex: number }> = [];

  lines.forEach((line, lineIndex) => {
    const match = line.match(/^([A-H])[\).:\-]\s+(.+)$/);
    if (match) {
      optionMatches.push({
        label: match[1].toUpperCase(),
        text: match[2].trim(),
        lineIndex
      });
    }
  });

  if (optionMatches.length < 2) return null;

  const firstOptionIndex = optionMatches[0].lineIndex;
  const questionLines = lines.slice(0, firstOptionIndex).filter((line) => {
    return !/\b(correct\s+answer|answer\s*:|đáp\s*án)\b/i.test(line);
  });

  const questionText = cleanQuestionText(questionLines.join(' '));
  if (!questionText || questionText.length < 8) return null;

  const id = `SWR302-Q${String(index).padStart(4, '0')}`;
  const options: QuizOption[] = optionMatches.map((option) => ({
    id: `${id}-OPT-${option.label}`,
    originalLabel: option.label,
    text: option.text
  }));
  const explicitCorrectLabels = parseExplicitCorrectOptions(lines);
  const correctOptionIds = explicitCorrectLabels
    .filter((label) => options.some((option) => option.originalLabel === label))
    .map((label) => `${id}-OPT-${label}`);
  const correctOptionId = correctOptionIds[0] ?? null;
  const chapter = detectChapter(lines);
  const topic = detectTopic(lines);
  const needsReview = correctOptionIds.length === 0;

  return {
    id,
    question: questionText,
    options,
    correctOptionId,
    correctOptionIds,
    explanation: '',
    chapter,
    topic,
    sourceImages: [sourceImage],
    confidence: 0,
    needsReview
  };
}

function parseMaterial(text: string, sourceImage: string, index: number): StudyMaterial {
  const lines = getLines(text);
  const title = titleFromLines(lines, sourceImage);
  return {
    id: `SWR302-M${String(index).padStart(4, '0')}`,
    title,
    chapter: detectChapter(lines),
    topic: detectTopic(lines),
    originalContent: text,
    sourceImages: [sourceImage],
    confidence: 0,
    needsReview: text.length < 20
  };
}

async function runOcr(imagePath: string): Promise<OcrResult> {
  if (!worker) {
    worker = await createWorker('eng', 1, {
      logger: (message) => {
        if (message.status === 'recognizing text' && message.progress === 1) {
          process.stdout.write('.');
        }
      }
    });
  }
  const result = await worker.recognize(imagePath);
  return {
    text: normalizeOcrText(result.data.text),
    confidence: Math.round((result.data.confidence ?? 0) * 100) / 100
  };
}

function markUnique(list: string[], file: string) {
  if (!list.includes(file)) list.push(file);
}

async function saveState(
  progress: ProcessingProgress,
  report: ExtractionReport,
  materials: StudyMaterial[],
  questions: QuizQuestion[]
) {
  report.processedImages = progress.processedImages;
  report.successfulImages = progress.successfulImages.length;
  report.failedImages = progress.failedImages;
  report.totalStudyMaterials = materials.length;
  report.totalExtractedQuestions = questions.length;
  report.validQuizQuestions = questions.filter((question) => getCorrectOptionIds(question).length > 0 && !question.needsReview).length;
  report.questionsWithoutCorrectAnswer = questions.filter((question) => getCorrectOptionIds(question).length === 0).length;
  report.questionsNeedingReview = questions.filter((question) => question.needsReview).length;
  report.completed =
    progress.completed &&
    progress.processedImages + progress.failedImages.length >= report.discoveredImages &&
    report.discoveredImages === EXPECTED_IMAGES;

  await writeJson(PROGRESS_PATH, progress);
  await writeJson(REPORT_PATH, report);
  await writeJson(MATERIALS_PATH, materials);
  await writeJson(QUESTIONS_PATH, questions);
}

function applyDuplicateMerge(questions: QuizQuestion[], progress: ProcessingProgress) {
  const seen = new Map<string, QuizQuestion>();
  const deduped: QuizQuestion[] = [];
  let removed = 0;

  for (const question of questions) {
    const fingerprint = normalizeForDuplicate(
      `${question.question} ${question.options.map((option) => `${option.originalLabel}:${option.text}`).join(' ')}`
    );
    const existing = seen.get(fingerprint);
    if (!existing) {
      seen.set(fingerprint, question);
      deduped.push(question);
      continue;
    }

    removed += 1;
    existing.sourceImages = Array.from(new Set([...existing.sourceImages, ...question.sourceImages]));
    if (getCorrectOptionIds(existing).length === 0 && getCorrectOptionIds(question).length > 0) {
      existing.correctOptionIds = getCorrectOptionIds(question).map((optionId) => optionId.replace(question.id, existing.id));
      existing.correctOptionId = existing.correctOptionIds[0] ?? null;
      existing.needsReview = false;
    }
    for (const sourceImage of question.sourceImages) markUnique(progress.duplicateImages, sourceImage);
  }

  return { questions: deduped, removed };
}

async function processImage(
  image: string,
  imageIndex: number,
  questionIndex: number,
  materialIndex: number
): Promise<ExtractedImage> {
  const imagePath = path.join(INPUT_DIR, image);
  const ocr = await runOcr(imagePath);
  if (!ocr.text) {
    return { file: image, material: null, question: null, failed: true, needsReview: true };
  }

  const parsedQuestion = parseQuestion(ocr.text, image, questionIndex);
  if (parsedQuestion) {
    parsedQuestion.confidence = ocr.confidence;
    parsedQuestion.needsReview = parsedQuestion.needsReview || ocr.confidence < 70;
    return {
      file: image,
      material: null,
      question: parsedQuestion,
      failed: false,
      needsReview: parsedQuestion.needsReview
    };
  }

  const material = parseMaterial(ocr.text, image, materialIndex || imageIndex);
  material.confidence = ocr.confidence;
  material.needsReview = material.needsReview || ocr.confidence < 65;
  return {
    file: image,
    material,
    question: null,
    failed: false,
    needsReview: material.needsReview
  };
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(SRC_DATA_DIR, { recursive: true });

  const images = await discoverImages();
  await mirrorImagesToPublic(images);

  const progress = await readJson(PROGRESS_PATH, defaultProgress(images.length));
  const report = await readJson(REPORT_PATH, defaultReport());
  let materials = await readJson<StudyMaterial[]>(MATERIALS_PATH, []);
  let questions = await readJson<QuizQuestion[]>(QUESTIONS_PATH, []);
  const processed = new Set(progress.successfulImages.concat(progress.failedImages));
  const remaining = images.filter((image) => !processed.has(image));

  progress.totalImages = EXPECTED_IMAGES;
  progress.processedImages = processed.size;
  report.discoveredImages = images.length;
  report.expectedImages = EXPECTED_IMAGES;

  console.log(`Discovered ${images.length} image(s). Remaining: ${remaining.length}. Batch size: ${BATCH_SIZE}.`);
  if (images.length !== EXPECTED_IMAGES) {
    console.warn(`Expected ${EXPECTED_IMAGES} images but found ${images.length}. Scan will continue and mark report incomplete.`);
  }

  for (let start = 0; start < remaining.length; start += BATCH_SIZE) {
    const batch = remaining.slice(start, start + BATCH_SIZE);
    console.log(`\nBatch ${Math.floor(start / BATCH_SIZE) + 1}: ${batch[0]} -> ${batch[batch.length - 1]}`);

    for (const image of batch) {
      try {
        const extracted = await processImage(image, images.indexOf(image) + 1, questions.length + 1, materials.length + 1);
        if (extracted.failed) {
          markUnique(progress.failedImages, image);
          markUnique(progress.needsReviewImages, image);
        } else {
          markUnique(progress.successfulImages, image);
          if (extracted.question) questions.push(extracted.question);
          if (extracted.material) materials.push(extracted.material);
          if (extracted.needsReview) markUnique(progress.needsReviewImages, image);
        }
      } catch (error) {
        console.error(`\nFailed ${image}:`, error);
        markUnique(progress.failedImages, image);
        markUnique(progress.needsReviewImages, image);
      }

      progress.lastProcessedFile = image;
      progress.processedImages = progress.successfulImages.length + progress.failedImages.length;
    }

    const dedupeResult = applyDuplicateMerge(questions, progress);
    questions = dedupeResult.questions;
    report.duplicateQuestionsRemoved += dedupeResult.removed;
    progress.completed = progress.processedImages >= images.length && images.length === EXPECTED_IMAGES;
    await saveState(progress, report, materials, questions);
    console.log(`Saved progress: ${progress.processedImages}/${images.length}`);
  }

  progress.completed = progress.processedImages >= images.length && images.length === EXPECTED_IMAGES;
  const finalDedupe = applyDuplicateMerge(questions, progress);
  questions = finalDedupe.questions;
  report.duplicateQuestionsRemoved += finalDedupe.removed;
  await saveState(progress, report, materials, questions);
  if (worker) await worker.terminate();
  console.log('\nScan finished.');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
