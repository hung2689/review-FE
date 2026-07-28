import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createWorker } from 'tesseract.js';
import type { ExtractionReport, QuizOption, QuizQuestion, StudyMaterial } from '../src/types/swr302';
import { getCorrectOptionIds } from '../src/utils/answers';
import { cleanAnswerText, cleanQuestionText } from '../src/utils/textCleanup';

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, 'input-images');
const DATA_DIR = path.join(ROOT, 'data');
const QUESTIONS_PATH = path.join(ROOT, 'src', 'data', 'swr302-questions.json');
const MATERIALS_PATH = path.join(ROOT, 'src', 'data', 'swr302-materials.json');
const REPORT_PATH = path.join(ROOT, 'data', 'extraction-report.json');
const NOTES_BY_IMAGE_PATH = path.join(ROOT, 'data', 'slide-notes-by-image.json');
const RESCAN_REPORT_PATH = path.join(ROOT, 'data', 'ocr-rescan-report.json');
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

type ParsedOption = {
  label: string;
  text: string;
};

type ParsedQuestion = {
  sourceImage: string;
  question: string;
  options: ParsedOption[];
  confidence: number;
};

type RepairChange = {
  id: string;
  sourceImage: string;
  reason: string;
  oldOptionChars: number;
  newOptionChars: number;
  oldLabels: string[];
  newLabels: string[];
};

type AddedQuestion = {
  id: string;
  sourceImage: string;
  labels: string[];
};

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
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

function normalizeOcrText(text: string) {
  return text
    .replace(/\r/g, '\n')
    .replace(/\u000b/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getLines(text: string) {
  return normalizeOcrText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function isFooterLine(line: string) {
  return (
    /ho[aà]ng\s+ho[aà]ng/i.test(line) ||
    /hodng\s+hoang/i.test(line) ||
    /\bbu[eé]n\s+source\b/i.test(line) ||
    /\bbu[oô]n\s+source\b/i.test(line) ||
    /©\s*/.test(line) ||
    /^\s*for\s*u\s*$/i.test(line)
  );
}

function isOcrNoiseLine(line: string) {
  const compact = line.replace(/[\s.,;:~_\-=—–]+/g, '');
  if (!compact) return false;
  if (/^(?:GOGGLE|BRB|G{2,}|E{2,}|R{2,}|B{2,}|S{4,}|(?:ER){2,}[A-Z]*|(?:RE){2,}[A-Z]*|(?:GE){2,}[A-Z]*|(?:BE){2,}[A-Z]*|RRR+)$/i.test(compact)) {
    return true;
  }
  if (/^(?:HE|SE|ET|CO|II|J)$/i.test(compact)) return true;

  const letters = compact.match(/[A-Za-z]/g) ?? [];
  const normalWords = line.match(/[A-Za-z]{3,}/g) ?? [];
  const lowerWords = normalWords.filter((word) => /[a-z]/.test(word));
  if (letters.length >= 4 && lowerWords.length === 0 && /^[EGRBSCIOTLHJ]+$/i.test(compact)) return true;

  return false;
}

function parseOptionStart(line: string) {
  const normalized = line.replace(/[，]/g, ',').replace(/[“”]/g, '"');
  const strict = normalized.match(/^([A-H])\s*[\).:\-]\s*(.*)$/i);
  if (strict) {
    return {
      label: strict[1].toUpperCase(),
      text: strict[2].trim()
    };
  }

  const spaced = normalized.match(/^([A-H])\s{2,}(.+)$/i);
  if (spaced) {
    return {
      label: spaced[1].toUpperCase(),
      text: spaced[2].trim()
    };
  }

  return null;
}

function parseQuestionFromOcr(text: string, sourceImage: string, confidence: number): ParsedQuestion | null {
  const lines = getLines(text).filter((line) => !isFooterLine(line) && !isOcrNoiseLine(line));
  const questionLines: string[] = [];
  const parsedOptions: ParsedOption[] = [];
  let currentOption: ParsedOption | null = null;

  for (const line of lines) {
    const optionStart = parseOptionStart(line);
    if (optionStart) {
      if (currentOption) parsedOptions.push(currentOption);
      currentOption = optionStart;
      continue;
    }

    if (currentOption) {
      currentOption.text = `${currentOption.text} ${line}`.trim();
    } else {
      questionLines.push(line);
    }
  }

  if (currentOption) parsedOptions.push(currentOption);

  const uniqueOptions = parsedOptions.filter((option, index, list) => {
    return list.findIndex((item) => item.label === option.label) === index;
  });

  if (uniqueOptions.length < 2) return null;

  const question = cleanQuestionText(questionLines.join(' '));
  if (question.length < 8) return null;

  const options = uniqueOptions
    .map((option) => ({
      label: option.label,
      text: cleanAnswerText(option.text)
    }))
    .filter((option) => option.text.length > 0);

  if (options.length < 2) return null;

  return {
    sourceImage,
    question,
    options,
    confidence
  };
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function optionCharCount(options: Array<{ text: string }>) {
  return options.reduce((total, option) => total + option.text.length, 0);
}

function labels(options: Array<{ originalLabel?: string; label?: string }>) {
  return options.map((option) => option.originalLabel ?? option.label ?? '').filter(Boolean);
}

function correctLabels(question: QuizQuestion) {
  const correctIds = new Set(getCorrectOptionIds(question));
  return question.options.filter((option) => correctIds.has(option.id)).map((option) => option.originalLabel);
}

function parseAnswerLabels(note: string) {
  const normalized = normalizeOcrText(note);
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 4)) {
    const compact = line.replace(/[\s,.;:/\\|+&()[\]{}-]+/g, '').toUpperCase();
    if (/^[A-H]{1,8}$/.test(compact)) return Array.from(new Set(compact.split('')));
  }

  const explicitAnswer = normalized.match(
    /\b(?:correct\s+answer|answer|dap\s*an\s*dung|đáp\s*án\s*đúng)\s*[:\-]?\s*([A-H](?:[\s,.;/+&]*(?:and|và)?[\s,.;/+&]*[A-H])*)/i
  );
  if (!explicitAnswer?.[1]) return [];

  return Array.from(new Set(explicitAnswer[1].toUpperCase().match(/[A-H]/g) ?? []));
}

function extractExplanation(note: string) {
  const normalized = normalizeOcrText(note);
  const match = normalized.match(/(?:giải\s*thích|explanation)\s*:\s*([\s\S]+)/i);
  return match?.[1]?.trim() ?? '';
}

function noteForQuestion(question: QuizQuestion, notesByImage: Record<string, string>) {
  return question.sourceImages.map((image) => notesByImage[image]).find(Boolean) ?? '';
}

function optionIdsForLabels(questionId: string, options: QuizOption[], answerLabels: string[]) {
  const availableLabels = new Set(options.map((option) => option.originalLabel));
  return answerLabels
    .filter((label) => availableLabels.has(label))
    .map((label) => `${questionId}-OPT-${label}`);
}

function shouldReplaceQuestion(current: QuizQuestion, candidate: ParsedQuestion) {
  const currentLabels = new Set(labels(current.options));
  const candidateLabels = new Set(labels(candidate.options));
  const keepsExistingLabels = Array.from(currentLabels).every((label) => candidateLabels.has(label));
  const gainsLabels = candidateLabels.size > currentLabels.size;
  const oldChars = optionCharCount(current.options);
  const newChars = optionCharCount(candidate.options);
  const longerOptions = newChars >= oldChars + 16;
  const questionHadOptionLeak = /\b[A-H]\s+[A-Za-z0-9][^?!.]*$/.test(current.question) && candidate.question.length < current.question.length;

  return (keepsExistingLabels && longerOptions) || gainsLabels || questionHadOptionLeak;
}

function applyCandidateToQuestion(
  question: QuizQuestion,
  candidate: ParsedQuestion,
  notesByImage: Record<string, string>,
  reason: string
): RepairChange {
  const oldOptionChars = optionCharCount(question.options);
  const oldLabels = labels(question.options);
  const oldCorrectLabels = correctLabels(question);
  const note = notesByImage[candidate.sourceImage] || noteForQuestion(question, notesByImage);
  const noteLabels = note ? parseAnswerLabels(note) : [];
  const answerLabels = noteLabels.length > 0 ? noteLabels : oldCorrectLabels;
  const explanation = note ? extractExplanation(note) : '';

  const nextOptions = candidate.options.map((option) => ({
    id: `${question.id}-OPT-${option.label}`,
    originalLabel: option.label,
    text: option.text
  }));
  const correctOptionIds = optionIdsForLabels(question.id, nextOptions, answerLabels);

  question.question = candidate.question;
  question.options = nextOptions;
  question.correctOptionId = correctOptionIds[0] ?? null;
  question.correctOptionIds = correctOptionIds;
  question.explanation = question.explanation || explanation;
  question.sourceImages = Array.from(new Set([...question.sourceImages, candidate.sourceImage])).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
  question.confidence = Math.max(question.confidence ?? 0, candidate.confidence);
  question.needsReview = correctOptionIds.length === 0;
  if (!question.chapter) question.chapter = '';
  if (!question.topic || normalizeForMatch(question.topic) === normalizeForMatch(question.question)) {
    question.topic = candidate.question;
  }

  return {
    id: question.id,
    sourceImage: candidate.sourceImage,
    reason,
    oldOptionChars,
    newOptionChars: optionCharCount(nextOptions),
    oldLabels,
    newLabels: labels(nextOptions)
  };
}

function nextQuestionId(questions: QuizQuestion[]) {
  const maxNumber = questions.reduce((max, question) => {
    const match = question.id.match(/Q(\d+)$/);
    return Math.max(max, match ? Number(match[1]) : 0);
  }, 0);
  return `SWR302-Q${String(maxNumber + 1).padStart(4, '0')}`;
}

function createQuestion(candidate: ParsedQuestion, notesByImage: Record<string, string>, id: string): QuizQuestion {
  const note = notesByImage[candidate.sourceImage] ?? '';
  const answerLabels = note ? parseAnswerLabels(note) : [];
  const options = candidate.options.map((option) => ({
    id: `${id}-OPT-${option.label}`,
    originalLabel: option.label,
    text: option.text
  }));
  const correctOptionIds = optionIdsForLabels(id, options, answerLabels);

  return {
    id,
    question: candidate.question,
    options,
    correctOptionId: correctOptionIds[0] ?? null,
    correctOptionIds,
    explanation: note ? extractExplanation(note) : '',
    chapter: '',
    topic: candidate.question,
    sourceImages: [candidate.sourceImage],
    confidence: candidate.confidence,
    needsReview: correctOptionIds.length === 0
  };
}

function findSimilarQuestion(candidate: ParsedQuestion, questions: QuizQuestion[]) {
  const candidateQuestion = normalizeForMatch(candidate.question);
  const candidatePrefix = candidateQuestion.split(' ').slice(0, 12).join(' ');

  return questions.find((question) => {
    const questionText = normalizeForMatch(question.question);
    return (
      questionText === candidateQuestion ||
      (candidatePrefix.length > 35 && questionText.startsWith(candidatePrefix)) ||
      (candidatePrefix.length > 35 && candidateQuestion.startsWith(questionText.split(' ').slice(0, 12).join(' ')))
    );
  });
}

function hasCorrectAnswers(question: QuizQuestion) {
  return getCorrectOptionIds(question).length > 0;
}

async function main() {
  const images = await discoverImages();
  const questions = await readJson<QuizQuestion[]>(QUESTIONS_PATH, []);
  const materials = await readJson<StudyMaterial[]>(MATERIALS_PATH, []);
  const notesByImage = await readJson<Record<string, string>>(NOTES_BY_IMAGE_PATH, {});
  const extractionReport = await readJson<ExtractionReport>(REPORT_PATH, {
    expectedImages: images.length,
    discoveredImages: images.length,
    processedImages: images.length,
    successfulImages: images.length,
    failedImages: [],
    totalStudyMaterials: materials.length,
    totalExtractedQuestions: questions.length,
    validQuizQuestions: 0,
    questionsWithoutCorrectAnswer: 0,
    questionsNeedingReview: 0,
    duplicateQuestionsRemoved: 0,
    completed: false
  });

  const worker = await createWorker('eng', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text' && message.progress === 1) process.stdout.write('.');
    }
  });

  const parsedByImage = new Map<string, ParsedQuestion>();
  const failedImages: string[] = [];

  for (const image of images) {
    try {
      const result = await worker.recognize(path.join(INPUT_DIR, image));
      const candidate = parseQuestionFromOcr(result.data.text, image, Math.round((result.data.confidence ?? 0) * 100) / 100);
      if (candidate) parsedByImage.set(image, candidate);
    } catch {
      failedImages.push(image);
    }
  }

  await worker.terminate();

  const questionByImage = new Map<string, QuizQuestion>();
  for (const question of questions) {
    for (const sourceImage of question.sourceImages) questionByImage.set(sourceImage, question);
  }

  const changes: RepairChange[] = [];
  const addedQuestions: AddedQuestion[] = [];

  for (const candidate of parsedByImage.values()) {
    const directQuestion = questionByImage.get(candidate.sourceImage);
    if (directQuestion) {
      if (shouldReplaceQuestion(directQuestion, candidate)) {
        changes.push(applyCandidateToQuestion(directQuestion, candidate, notesByImage, 'source-image-rescan'));
      }
      continue;
    }

    const similarQuestion = findSimilarQuestion(candidate, questions);
    if (similarQuestion) {
      if (shouldReplaceQuestion(similarQuestion, candidate)) {
        changes.push(applyCandidateToQuestion(similarQuestion, candidate, notesByImage, 'similar-question-rescan'));
      } else if (!similarQuestion.sourceImages.includes(candidate.sourceImage)) {
        similarQuestion.sourceImages = Array.from(new Set([...similarQuestion.sourceImages, candidate.sourceImage])).sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
        );
      }
      questionByImage.set(candidate.sourceImage, similarQuestion);
      continue;
    }

    const note = notesByImage[candidate.sourceImage] ?? '';
    const answerLabels = note ? parseAnswerLabels(note) : [];
    const id = nextQuestionId(questions);
    const question = createQuestion(candidate, notesByImage, id);
    questions.push(question);
    questionByImage.set(candidate.sourceImage, question);
    addedQuestions.push({ id, sourceImage: candidate.sourceImage, labels: answerLabels });
  }

  const questionSourceImages = new Set(questions.flatMap((question) => question.sourceImages));
  const filteredMaterials = materials.filter((material) => {
    return !material.sourceImages.some((sourceImage) => questionSourceImages.has(sourceImage));
  });

  extractionReport.discoveredImages = images.length;
  extractionReport.totalStudyMaterials = filteredMaterials.length;
  extractionReport.totalExtractedQuestions = questions.length;
  extractionReport.validQuizQuestions = questions.filter((question) => hasCorrectAnswers(question) && !question.needsReview).length;
  extractionReport.questionsWithoutCorrectAnswer = questions.filter((question) => !hasCorrectAnswers(question)).length;
  extractionReport.questionsNeedingReview = questions.filter((question) => question.needsReview).length;

  await writeJson(QUESTIONS_PATH, questions);
  await writeJson(MATERIALS_PATH, filteredMaterials);
  await writeJson(REPORT_PATH, extractionReport);
  await writeJson(RESCAN_REPORT_PATH, {
    scannedImages: images.length,
    parsedQuestionImages: parsedByImage.size,
    ocrFailures: failedImages,
    updatedQuestions: changes.length,
    addedQuestions: addedQuestions.length,
    removedMaterials: materials.length - filteredMaterials.length,
    validQuizQuestions: extractionReport.validQuizQuestions,
    questionsWithoutCorrectAnswer: extractionReport.questionsWithoutCorrectAnswer,
    questionsNeedingReview: extractionReport.questionsNeedingReview,
    sampleChanges: changes.slice(0, 25),
    sampleAddedQuestions: addedQuestions.slice(0, 25)
  });

  console.log(
    JSON.stringify(
      {
        scannedImages: images.length,
        parsedQuestionImages: parsedByImage.size,
        updatedQuestions: changes.length,
        addedQuestions: addedQuestions.length,
        removedMaterials: materials.length - filteredMaterials.length,
        validQuizQuestions: extractionReport.validQuizQuestions,
        questionsWithoutCorrectAnswer: extractionReport.questionsWithoutCorrectAnswer,
        questionsNeedingReview: extractionReport.questionsNeedingReview,
        reportPath: RESCAN_REPORT_PATH,
        sampleChanges: changes.slice(0, 10),
        sampleAddedQuestions: addedQuestions.slice(0, 10)
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
