import { describe, expect, it, beforeEach } from 'vitest';
import { loadStats, saveActiveSession, saveStats } from './storage';
import type { PracticeSession } from '../types/swr302';

const session: PracticeSession = {
  id: 'session-test',
  questionIds: ['SWR302-Q0001'],
  optionOrderByQuestionId: {
    'SWR302-Q0001': ['SWR302-Q0001-OPT-B', 'SWR302-Q0001-OPT-A']
  },
  answers: {},
  currentIndex: 0,
  startedAt: '2026-07-28T00:00:00.000Z',
  completedAt: null
};

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists active session with fixed question and answer order', () => {
    saveStats({
      answeredQuestionIds: [],
      correctQuestionIds: [],
      wrongQuestionIds: [],
      totalPracticeRuns: 0,
      correctRate: 0,
      shuffleQuestions: true,
      shuffleAnswers: true,
      activeSession: null,
      lastCompletedSession: null
    });
    saveActiveSession(session);

    expect(loadStats().activeSession).toEqual(session);
  });
});

