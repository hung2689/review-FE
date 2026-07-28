import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../types/swr302';
import { isOfficialPracticeQuestion } from './data';

function makeQuestion(patch: Partial<QuizQuestion>): QuizQuestion {
  return {
    id: 'SWR302-Q0001',
    question: 'Question',
    options: [{ id: 'SWR302-Q0001-OPT-A', originalLabel: 'A', text: 'Answer' }],
    correctOptionId: 'SWR302-Q0001-OPT-A',
    correctOptionIds: ['SWR302-Q0001-OPT-A'],
    explanation: '',
    chapter: '',
    topic: '',
    sourceImages: ['slide_001.png'],
    confidence: 90,
    needsReview: false,
    ...patch
  };
}

describe('isOfficialPracticeQuestion', () => {
  it('excludes questions without a correct answer', () => {
    expect(isOfficialPracticeQuestion(makeQuestion({ correctOptionId: null, correctOptionIds: [] }))).toBe(false);
  });

  it('excludes questions that need review', () => {
    expect(isOfficialPracticeQuestion(makeQuestion({ needsReview: true }))).toBe(false);
  });

  it('allows verified questions', () => {
    expect(isOfficialPracticeQuestion(makeQuestion({}))).toBe(true);
  });
});
