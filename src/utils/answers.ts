import type { PracticeAnswer, QuizQuestion } from '../types/swr302';

export function getCorrectOptionIds(question: QuizQuestion) {
  return question.correctOptionIds?.length
    ? question.correctOptionIds
    : question.correctOptionId
      ? [question.correctOptionId]
      : [];
}

export function getSelectedOptionIds(answer: PracticeAnswer | undefined | null) {
  return answer?.selectedOptionIds?.length
    ? answer.selectedOptionIds
    : answer?.selectedOptionId
      ? [answer.selectedOptionId]
      : [];
}

export function normalizeOptionIds(optionIds: string[]) {
  return Array.from(new Set(optionIds)).sort((a, b) => a.localeCompare(b));
}

export function optionSetsMatch(left: string[], right: string[]) {
  const normalizedLeft = normalizeOptionIds(left);
  const normalizedRight = normalizeOptionIds(right);
  return (
    normalizedLeft.length > 0 &&
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((optionId, index) => optionId === normalizedRight[index])
  );
}

export function getCorrectLabels(question: QuizQuestion) {
  const correctOptionIds = new Set(getCorrectOptionIds(question));
  return question.options
    .filter((option) => correctOptionIds.has(option.id))
    .map((option) => option.originalLabel)
    .join(', ');
}
