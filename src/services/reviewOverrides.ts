import type { QuizQuestion, StudyMaterial } from '../types/swr302';

const KEY = 'swr302-review-overrides';

export interface ReviewOverride {
  id: string;
  kind: 'question' | 'material';
  correctedText: string;
  correctOptionId: string | null;
  correctOptionIds: string[];
  confirmed: boolean;
  rejectedDuplicate: boolean;
  updatedAt: string;
}

export type ReviewOverrides = Record<string, ReviewOverride>;

export function loadOverrides(): ReviewOverrides {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as ReviewOverrides;
  } catch {
    return {};
  }
}

export function saveOverride(override: ReviewOverride) {
  const overrides = loadOverrides();
  overrides[override.id] = override;
  localStorage.setItem(KEY, JSON.stringify(overrides));
}

export function makeQuestionOverride(question: QuizQuestion, patch: Partial<ReviewOverride>): ReviewOverride {
  return {
    id: question.id,
    kind: 'question',
    correctedText: question.question,
    correctOptionId: question.correctOptionId,
    correctOptionIds: question.correctOptionIds ?? (question.correctOptionId ? [question.correctOptionId] : []),
    confirmed: false,
    rejectedDuplicate: false,
    updatedAt: new Date().toISOString(),
    ...patch
  };
}

export function makeMaterialOverride(material: StudyMaterial, patch: Partial<ReviewOverride>): ReviewOverride {
  return {
    id: material.id,
    kind: 'material',
    correctedText: material.originalContent,
    correctOptionId: null,
    correctOptionIds: [],
    confirmed: false,
    rejectedDuplicate: false,
    updatedAt: new Date().toISOString(),
    ...patch
  };
}
