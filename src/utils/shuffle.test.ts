import { describe, expect, it } from 'vitest';
import { fisherYates, seededRandom } from './shuffle';

describe('fisherYates', () => {
  it('keeps every question while shuffling', () => {
    const original = ['q1', 'q2', 'q3', 'q4', 'q5'];
    const shuffled = fisherYates(original, seededRandom('stable'));

    expect(shuffled).toHaveLength(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });
});

