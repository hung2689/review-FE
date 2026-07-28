import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ExtractionReport, QuizQuestion } from '../src/types/swr302';

const ROOT = process.cwd();
const NOTES_BY_ID_PATH = path.join(ROOT, 'data', 'slide-notes-by-id.json');
const NOTES_BY_IMAGE_PATH = path.join(ROOT, 'data', 'slide-notes-by-image.json');
const QUESTIONS_PATH = path.join(ROOT, 'src', 'data', 'swr302-questions.json');
const REPORT_PATH = path.join(ROOT, 'data', 'extraction-report.json');
const MANIFEST_PATH = path.resolve(ROOT, '..', 'work', 'slide_images_raw', 'manifest.json');

type SlideManifestItem = {
  index: number;
  url: string;
  file: string;
};

type AppliedAnswer = {
  questionId: string;
  sourceImages: string[];
  labels: string[];
  correctOptionIds: string[];
};

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, 'utf8')) as T;
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function slideIdFromUrl(rawUrl: string) {
  const parsed = new URL(rawUrl);
  return parsed.searchParams.get('slide')?.replace(/^id\./, '') ?? null;
}

function normalizeNoteText(note: string) {
  return note
    .replace(/\u000b/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function uniqueLabels(labels: string[]) {
  return Array.from(new Set(labels.map((label) => label.toUpperCase())));
}

function labelsFromAnswerText(text: string) {
  const labels = text.toUpperCase().match(/[A-H]/g) ?? [];
  return uniqueLabels(labels);
}

function parseAnswerLabels(note: string) {
  const normalized = normalizeNoteText(note);
  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 4)) {
    const compact = line.replace(/[\s,.;:/\\|+&()[\]{}-]+/g, '').toUpperCase();
    if (/^[A-H]{1,8}$/.test(compact)) {
      return uniqueLabels(compact.split(''));
    }
  }

  const explicitAnswer = normalized.match(
    /\b(?:correct\s+answer|answer|dap\s*an\s*dung|đáp\s*án\s*đúng)\s*[:\-]?\s*([A-H](?:[\s,.;/+&]*(?:and|và)?[\s,.;/+&]*[A-H])*)/i
  );
  if (explicitAnswer?.[1]) {
    return labelsFromAnswerText(explicitAnswer[1]);
  }

  return [];
}

function extractExplanation(note: string) {
  const normalized = normalizeNoteText(note);
  const match = normalized.match(/(?:giải\s*thích|explanation)\s*:\s*([\s\S]+)/i);
  return match?.[1]?.trim() ?? '';
}

function applyLabelsToQuestion(question: QuizQuestion, labels: string[]) {
  const optionIds = labels
    .map((label) => question.options.find((option) => option.originalLabel.toUpperCase() === label)?.id)
    .filter(Boolean) as string[];

  if (optionIds.length !== labels.length) return null;
  return optionIds;
}

function hasCorrectAnswers(question: QuizQuestion) {
  return (question.correctOptionIds?.length ?? 0) > 0 || Boolean(question.correctOptionId);
}

async function main() {
  const notesBySlideId = await readJson<Record<string, string>>(NOTES_BY_ID_PATH);
  const manifest = await readJson<SlideManifestItem[]>(MANIFEST_PATH);
  const questions = await readJson<QuizQuestion[]>(QUESTIONS_PATH);
  const report = await readJson<ExtractionReport>(REPORT_PATH);

  const notesByImage: Record<string, string> = {};
  for (const item of manifest) {
    const slideId = slideIdFromUrl(item.url);
    if (!slideId) continue;

    const note = notesBySlideId[slideId];
    if (note) notesByImage[path.basename(item.file)] = normalizeNoteText(note);
  }

  const applied: AppliedAnswer[] = [];
  const unresolved: Array<{ questionId: string; sourceImages: string[]; notePreview: string }> = [];

  const updatedQuestions = questions.map((question) => {
    let matchedNote = '';
    let labels: string[] = [];

    for (const sourceImage of question.sourceImages) {
      const note = notesByImage[sourceImage];
      if (!note) continue;

      const parsedLabels = parseAnswerLabels(note);
      if (parsedLabels.length === 0) {
        matchedNote = note;
        continue;
      }

      const correctOptionIds = applyLabelsToQuestion(question, parsedLabels);
      if (!correctOptionIds) {
        matchedNote = note;
        labels = parsedLabels;
        continue;
      }

      matchedNote = note;
      labels = parsedLabels;
      const explanation = extractExplanation(note);
      applied.push({
        questionId: question.id,
        sourceImages: question.sourceImages,
        labels,
        correctOptionIds
      });

      return {
        ...question,
        correctOptionId: correctOptionIds[0] ?? null,
        correctOptionIds,
        explanation: explanation || question.explanation,
        needsReview: false
      };
    }

    const legacyCorrectOptionIds = question.correctOptionId ? [question.correctOptionId] : question.correctOptionIds ?? [];
    if (matchedNote && labels.length > 0) {
      unresolved.push({
        questionId: question.id,
        sourceImages: question.sourceImages,
        notePreview: matchedNote.slice(0, 120)
      });
    }

    return {
      ...question,
      correctOptionIds: legacyCorrectOptionIds
    };
  });

  const validQuizQuestions = updatedQuestions.filter(
    (question) => hasCorrectAnswers(question) && !question.needsReview
  ).length;
  const questionsWithoutCorrectAnswer = updatedQuestions.filter((question) => !hasCorrectAnswers(question)).length;
  const questionsNeedingReview = updatedQuestions.filter((question) => question.needsReview).length;

  await writeJson(QUESTIONS_PATH, updatedQuestions);
  await writeJson(NOTES_BY_IMAGE_PATH, notesByImage);
  await writeJson(REPORT_PATH, {
    ...report,
    totalExtractedQuestions: updatedQuestions.length,
    validQuizQuestions,
    questionsWithoutCorrectAnswer,
    questionsNeedingReview
  });

  console.log(
    JSON.stringify(
      {
        slideNotes: Object.keys(notesBySlideId).length,
        imageNotes: Object.keys(notesByImage).length,
        appliedAnswers: applied.length,
        multiAnswerQuestions: applied.filter((item) => item.correctOptionIds.length > 1).length,
        unresolvedNotes: unresolved.length,
        validQuizQuestions,
        questionsWithoutCorrectAnswer,
        questionsNeedingReview,
        unresolved: unresolved.slice(0, 10)
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
