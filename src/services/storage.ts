import type { PracticeSession, StoredStats } from '../types/swr302';

const STORAGE_KEY = 'swr302-practice-hub-state';

const defaults: StoredStats = {
  answeredQuestionIds: [],
  correctQuestionIds: [],
  wrongQuestionIds: [],
  totalPracticeRuns: 0,
  correctRate: 0,
  shuffleQuestions: true,
  shuffleAnswers: true,
  activeSession: null,
  lastCompletedSession: null
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function loadStats(): StoredStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as StoredStats) };
  } catch {
    return defaults;
  }
}

export function saveStats(stats: StoredStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function saveActiveSession(session: PracticeSession | null) {
  const stats = loadStats();
  saveStats({ ...stats, activeSession: session });
}

export function recordSession(session: PracticeSession) {
  const stats = loadStats();
  const answers = Object.values(session.answers);
  const correct = answers.filter((answer) => answer.isCorrect).map((answer) => answer.questionId);
  const wrong = answers.filter((answer) => !answer.isCorrect).map((answer) => answer.questionId);
  const correctQuestionIds = unique([...stats.correctQuestionIds, ...correct].filter((id) => !wrong.includes(id)));
  const wrongQuestionIds = unique([...stats.wrongQuestionIds, ...wrong]);
  const answeredQuestionIds = unique([...stats.answeredQuestionIds, ...answers.map((answer) => answer.questionId)]);
  const correctRate = answeredQuestionIds.length ? Math.round((correctQuestionIds.length / answeredQuestionIds.length) * 100) : 0;

  saveStats({
    ...stats,
    answeredQuestionIds,
    correctQuestionIds,
    wrongQuestionIds,
    totalPracticeRuns: stats.totalPracticeRuns + 1,
    correctRate,
    activeSession: null,
    lastCompletedSession: completedSession(session)
  });
}

function completedSession(session: PracticeSession): PracticeSession {
  return session.completedAt ? session : { ...session, completedAt: new Date().toISOString() };
}

export function resetStats() {
  saveStats(defaults);
}
