import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../types/swr302';
import { fisherYates, seededRandom } from '../utils/shuffle';

const question: QuizQuestion = {
  id: 'SWR302-Q0001',
  question: 'Which option is correct?',
  options: [
    { id: 'SWR302-Q0001-OPT-A', originalLabel: 'A', text: 'A text' },
    { id: 'SWR302-Q0001-OPT-B', originalLabel: 'B', text: 'B text' },
    { id: 'SWR302-Q0001-OPT-C', originalLabel: 'C', text: 'C text' }
  ],
  correctOptionId: 'SWR302-Q0001-OPT-A',
  correctOptionIds: ['SWR302-Q0001-OPT-A', 'SWR302-Q0001-OPT-C'],
  explanation: '',
  chapter: '',
  topic: '',
  sourceImages: ['slide_001.png'],
  confidence: 95,
  needsReview: false
};

describe('answer shuffling contract', () => {
  it('does not change correct option ids when option order changes', () => {
    const shuffled = fisherYates(question.options, seededRandom('answers'));

    expect(shuffled.map((option) => option.id).sort()).toEqual(question.options.map((option) => option.id).sort());
    expect(question.correctOptionId).toBe('SWR302-Q0001-OPT-A');
    expect(shuffled.some((option) => option.id === question.correctOptionId)).toBe(true);
    expect(question.correctOptionIds).toEqual(['SWR302-Q0001-OPT-A', 'SWR302-Q0001-OPT-C']);
    expect(question.correctOptionIds.every((optionId) => shuffled.some((option) => option.id === optionId))).toBe(true);
  });
});
