import { describe, expect, it } from 'vitest';
import { optionSetsMatch } from './answers';

describe('optionSetsMatch', () => {
  it('accepts the same selected answers in any order', () => {
    expect(optionSetsMatch(['SWR302-Q0001-OPT-C', 'SWR302-Q0001-OPT-A'], ['SWR302-Q0001-OPT-A', 'SWR302-Q0001-OPT-C'])).toBe(true);
  });

  it('rejects missing or extra selected answers', () => {
    expect(optionSetsMatch(['SWR302-Q0001-OPT-A'], ['SWR302-Q0001-OPT-A', 'SWR302-Q0001-OPT-C'])).toBe(false);
    expect(optionSetsMatch(['SWR302-Q0001-OPT-A', 'SWR302-Q0001-OPT-B'], ['SWR302-Q0001-OPT-A'])).toBe(false);
  });
});
