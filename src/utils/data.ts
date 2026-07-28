import materialsJson from '../data/swr302-materials.json';
import questionsJson from '../data/swr302-questions.json';
import type { QuizQuestion, StudyMaterial } from '../types/swr302';
import { getCorrectOptionIds } from './answers';

export const materials = materialsJson as StudyMaterial[];
export const questions = questionsJson as QuizQuestion[];

export function isOfficialPracticeQuestion(question: QuizQuestion) {
  return getCorrectOptionIds(question).length > 0 && !question.needsReview;
}

export const validPracticeQuestions = questions.filter(isOfficialPracticeQuestion);
export const reviewQuestions = questions.filter((question) => question.needsReview || getCorrectOptionIds(question).length === 0);

export function getChapters() {
  return Array.from(
    new Set([...materials.map((item) => item.chapter), ...questions.map((item) => item.chapter)].filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export function getTopics() {
  return Array.from(new Set([...materials.map((item) => item.topic), ...questions.map((item) => item.topic)].filter(Boolean))).sort(
    (a, b) => a.localeCompare(b)
  );
}

export function sourceImageUrl(fileName: string) {
  return `/input-images/${encodeURIComponent(fileName)}`;
}

export function getStats(answered = 0, correctRate = 0) {
  return {
    materialCount: materials.length,
    validQuestionCount: validPracticeQuestions.length,
    reviewQuestionCount: reviewQuestions.length,
    chapterCount: getChapters().length,
    practicedCount: answered,
    correctRate
  };
}
