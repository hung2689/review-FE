import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ExtractionReport, ProcessingProgress, QuizQuestion, StudyMaterial } from '../src/types/swr302';

const ROOT = process.cwd();
const EXPECTED_IMAGES = 439;
const INPUT_DIR = path.join(ROOT, 'input-images');
const PROGRESS_PATH = path.join(ROOT, 'data', 'processing-progress.json');
const REPORT_PATH = path.join(ROOT, 'data', 'extraction-report.json');
const MATERIALS_PATH = path.join(ROOT, 'src', 'data', 'swr302-materials.json');
const QUESTIONS_PATH = path.join(ROOT, 'src', 'data', 'swr302-questions.json');
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function getCorrectOptionIds(question: QuizQuestion) {
  return question.correctOptionIds?.length
    ? question.correctOptionIds
    : question.correctOptionId
      ? [question.correctOptionId]
      : [];
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

async function main() {
  const images = (await readdir(INPUT_DIR)).filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const progress = await readJson<ProcessingProgress>(PROGRESS_PATH);
  const materials = await readJson<StudyMaterial[]>(MATERIALS_PATH);
  const questions = await readJson<QuizQuestion[]>(QUESTIONS_PATH);
  const errors: string[] = [];

  if (images.length !== EXPECTED_IMAGES) errors.push(`Expected ${EXPECTED_IMAGES} images, found ${images.length}.`);
  if (progress.processedImages !== progress.successfulImages.length + progress.failedImages.length) {
    errors.push('processedImages does not match successfulImages + failedImages.');
  }

  for (const question of questions) {
    const optionIds = new Set(question.options.map((option) => option.id));
    if (question.correctOptionId && !optionIds.has(question.correctOptionId)) {
      errors.push(`${question.id} has a correctOptionId that is not in options.`);
    }
    for (const correctOptionId of getCorrectOptionIds(question)) {
      if (!optionIds.has(correctOptionId)) {
        errors.push(`${question.id} has a correctOptionIds entry that is not in options.`);
      }
    }
    if (question.options.length < 2) {
      errors.push(`${question.id} has fewer than 2 options.`);
    }
  }

  const classifiedImages = new Set([
    ...progress.successfulImages,
    ...progress.failedImages,
    ...progress.duplicateImages,
    ...progress.needsReviewImages
  ]);

  const report: ExtractionReport = {
    expectedImages: EXPECTED_IMAGES,
    discoveredImages: images.length,
    processedImages: progress.processedImages,
    successfulImages: progress.successfulImages.length,
    failedImages: progress.failedImages,
    totalStudyMaterials: materials.length,
    totalExtractedQuestions: questions.length,
    validQuizQuestions: questions.filter((question) => getCorrectOptionIds(question).length > 0 && !question.needsReview).length,
    questionsWithoutCorrectAnswer: questions.filter((question) => getCorrectOptionIds(question).length === 0).length,
    questionsNeedingReview: questions.filter((question) => question.needsReview).length,
    duplicateQuestionsRemoved: progress.duplicateImages.length,
    completed:
      errors.length === 0 &&
      images.length === EXPECTED_IMAGES &&
      classifiedImages.size >= EXPECTED_IMAGES &&
      progress.processedImages >= EXPECTED_IMAGES
  };

  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
