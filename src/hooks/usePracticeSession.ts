import { useMemo, useState } from 'react';
import { questions, validPracticeQuestions } from '../utils/data';
import { fisherYates, seededRandom } from '../utils/shuffle';
import { loadStats, recordSession, saveActiveSession } from '../services/storage';
import type { PracticeAnswer, PracticeConfig, PracticeSession, QuizQuestion } from '../types/swr302';
import { getCorrectOptionIds, normalizeOptionIds, optionSetsMatch } from '../utils/answers';

function selectQuestionPool(config: PracticeConfig) {
  const stats = loadStats();
  let pool = validPracticeQuestions;

  if (config.mode === 'wrong') {
    const wrongIds = new Set(stats.wrongQuestionIds);
    pool = pool.filter((question) => wrongIds.has(question.id));
  }
  if (config.mode === 'chapter' && config.chapter) {
    pool = pool.filter((question) => question.chapter === config.chapter);
  }
  if (config.mode === 'topic' && config.topic) {
    pool = pool.filter((question) => question.topic === config.topic);
  }

  const random = seededRandom(`${Date.now()}-${pool.length}-${config.mode}`);
  const ordered = config.shuffleQuestions ? fisherYates(pool, random) : [...pool];
  return config.questionCount === 'all' ? ordered : ordered.slice(0, config.questionCount);
}

export function buildPracticeSession(config: PracticeConfig): PracticeSession {
  const selected = selectQuestionPool(config);
  const optionOrderByQuestionId: Record<string, string[]> = {};
  const seed = `${Date.now()}-${selected.map((question) => question.id).join('|')}`;

  selected.forEach((question, index) => {
    const options = config.shuffleAnswers
      ? fisherYates(question.options, seededRandom(`${seed}-${index}`))
      : [...question.options];
    optionOrderByQuestionId[question.id] = options.map((option) => option.id);
  });

  return {
    id: `session-${Date.now()}`,
    questionIds: selected.map((question) => question.id),
    optionOrderByQuestionId,
    answers: {},
    currentIndex: 0,
    startedAt: new Date().toISOString(),
    completedAt: null
  };
}

export function usePracticeSession(initialSession: PracticeSession | null) {
  const [session, setSession] = useState<PracticeSession | null>(initialSession);
  const questionById = useMemo(() => new Map(questions.map((question) => [question.id, question])), []);

  const currentQuestion: QuizQuestion | null = session ? questionById.get(session.questionIds[session.currentIndex]) ?? null : null;

  function updateSession(next: PracticeSession | null) {
    setSession(next);
    saveActiveSession(next);
  }

  function answer(questionId: string, selectedOptionIds: string[]) {
    if (!session || session.answers[questionId]) return;
    const question = questionById.get(questionId);
    const correctOptionIds = question ? getCorrectOptionIds(question) : [];
    const normalizedSelectedOptionIds = normalizeOptionIds(selectedOptionIds);
    if (!question || correctOptionIds.length === 0 || normalizedSelectedOptionIds.length === 0) return;

    const answerValue: PracticeAnswer = {
      questionId,
      selectedOptionIds: normalizedSelectedOptionIds,
      selectedOptionId: normalizedSelectedOptionIds[0],
      isCorrect: optionSetsMatch(normalizedSelectedOptionIds, correctOptionIds)
    };
    updateSession({
      ...session,
      answers: {
        ...session.answers,
        [questionId]: answerValue
      }
    });
  }

  function goTo(index: number) {
    if (!session) return;
    updateSession({ ...session, currentIndex: Math.min(Math.max(index, 0), session.questionIds.length - 1) });
  }

  function finish() {
    if (!session) return null;
    const completed: PracticeSession = { ...session, completedAt: new Date().toISOString() };
    recordSession(completed);
    setSession(completed);
    return completed;
  }

  return {
    session,
    setSession: updateSession,
    currentQuestion,
    questionById,
    answer,
    goTo,
    finish
  };
}
