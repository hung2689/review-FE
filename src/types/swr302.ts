export type ContentType =
  | 'STUDY_MATERIAL'
  | 'QUIZ_QUESTION'
  | 'ANSWER_KEY'
  | 'MIXED_CONTENT'
  | 'DUPLICATE'
  | 'UNREADABLE'
  | 'NEEDS_REVIEW';

export interface StudyMaterial {
  id: string;
  title: string;
  chapter: string;
  topic: string;
  originalContent: string;
  sourceImages: string[];
  confidence: number;
  needsReview: boolean;
}

export interface QuizOption {
  id: string;
  originalLabel: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string | null;
  correctOptionIds: string[];
  explanation: string;
  chapter: string;
  topic: string;
  sourceImages: string[];
  confidence: number;
  needsReview: boolean;
}

export interface ProcessingProgress {
  totalImages: number;
  processedImages: number;
  successfulImages: string[];
  failedImages: string[];
  duplicateImages: string[];
  needsReviewImages: string[];
  lastProcessedFile: string | null;
  completed: boolean;
}

export interface ExtractionReport {
  expectedImages: number;
  discoveredImages: number;
  processedImages: number;
  successfulImages: number;
  failedImages: string[];
  totalStudyMaterials: number;
  totalExtractedQuestions: number;
  validQuizQuestions: number;
  questionsWithoutCorrectAnswer: number;
  questionsNeedingReview: number;
  duplicateQuestionsRemoved: number;
  completed: boolean;
}

export interface PracticeConfig {
  mode: 'all' | 'chapter' | 'topic' | 'wrong';
  chapter: string;
  topic: string;
  questionCount: number | 'all';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  instantFeedback: boolean;
}

export interface PracticeAnswer {
  questionId: string;
  selectedOptionIds: string[];
  selectedOptionId?: string;
  isCorrect: boolean;
}

export interface PracticeSession {
  id: string;
  questionIds: string[];
  optionOrderByQuestionId: Record<string, string[]>;
  answers: Record<string, PracticeAnswer>;
  currentIndex: number;
  startedAt: string;
  completedAt: string | null;
}

export interface StoredStats {
  answeredQuestionIds: string[];
  correctQuestionIds: string[];
  wrongQuestionIds: string[];
  totalPracticeRuns: number;
  correctRate: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  activeSession: PracticeSession | null;
  lastCompletedSession: PracticeSession | null;
}
