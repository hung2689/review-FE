import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Flag, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnswerOption } from '../components/AnswerOption';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { usePracticeSession } from '../hooks/usePracticeSession';
import { loadStats } from '../services/storage';
import { getCorrectLabels, getCorrectOptionIds, getSelectedOptionIds } from '../utils/answers';

export function PracticePage() {
  const navigate = useNavigate();
  const activeSession = loadStats().activeSession;
  const { session, currentQuestion, questionById, answer, goTo, finish } = usePracticeSession(activeSession);
  const [pendingOptionIdsByQuestionId, setPendingOptionIdsByQuestionId] = useState<Record<string, string[]>>({});

  if (!session || !currentQuestion) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-line bg-panel p-6 text-center">
        <h1 className="text-xl font-bold">Chưa có phiên luyện tập</h1>
        <p className="mt-2 text-sm text-muted">Hãy tạo một bài luyện tập mới từ màn hình cấu hình.</p>
        <Link to="/practice/setup" className="mt-5 inline-block">
          <Button variant="primary">Tạo bài luyện tập</Button>
        </Link>
      </div>
    );
  }

  const questionId = currentQuestion.id;
  const answered = session.answers[questionId];
  const correctOptionIds = getCorrectOptionIds(currentQuestion);
  const isMultiAnswer = correctOptionIds.length > 1;
  const submitted = Boolean(answered);
  const pendingOptionIds = pendingOptionIdsByQuestionId[questionId] ?? [];
  const selectedOptionIds = submitted ? getSelectedOptionIds(answered) : pendingOptionIds;
  const optionOrder = session.optionOrderByQuestionId[questionId] ?? currentQuestion.options.map((option) => option.id);
  const options = optionOrder
    .map((optionId) => currentQuestion.options.find((option) => option.id === optionId))
    .filter(Boolean) as typeof currentQuestion.options;
  const progress = ((session.currentIndex + 1) / session.questionIds.length) * 100;

  function finishPractice() {
    const completed = finish();
    if (completed) navigate('/results');
  }

  function selectOption(optionId: string) {
    if (submitted) return;
    if (!isMultiAnswer) {
      answer(questionId, [optionId]);
      return;
    }

    setPendingOptionIdsByQuestionId((current) => {
      const existing = current[questionId] ?? [];
      const next = existing.includes(optionId)
        ? existing.filter((selectedId) => selectedId !== optionId)
        : [...existing, optionId];
      return { ...current, [questionId]: next };
    });
  }

  function submitMultiAnswer() {
    answer(questionId, selectedOptionIds);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="rounded-md border border-line bg-panel p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Câu {session.currentIndex + 1} / {session.questionIds.length}</p>
            <h1 className="mt-2 whitespace-pre-wrap text-xl font-bold leading-8">{currentQuestion.question}</h1>
          </div>
          <Button className="w-full md:w-auto" variant="danger" onClick={finishPractice}>
            <Flag size={16} /> Kết thúc bài
          </Button>
        </div>

        <div className="mt-5">
          <ProgressBar value={progress} />
        </div>

        <div className="mt-5 space-y-3">
          {options.map((option) => (
            <AnswerOption
              key={option.id}
              option={option}
              selectedOptionIds={selectedOptionIds}
              correctOptionIds={correctOptionIds}
              submitted={submitted}
              disabled={submitted}
              onSelect={selectOption}
            />
          ))}
        </div>

        {isMultiAnswer && !submitted ? (
          <div className="mt-4 flex flex-col gap-3 rounded-md border border-line bg-canvas p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-muted">
              Chọn {correctOptionIds.length} đáp án. Đã chọn {selectedOptionIds.length}.
            </p>
            <Button variant="primary" disabled={selectedOptionIds.length === 0} onClick={submitMultiAnswer}>
              <CheckCircle2 size={16} /> Chốt đáp án
            </Button>
          </div>
        ) : null}

        {answered ? (
          <div
            className={`mt-4 rounded-md border p-3 text-sm font-semibold ${
              answered.isCorrect ? 'border-success bg-success/10 text-success' : 'border-danger bg-danger/10 text-danger'
            }`}
          >
            {answered.isCorrect ? 'Correct answer' : 'Incorrect answer'}
            <span className="mt-1 block text-ink sm:ml-2 sm:mt-0 sm:inline">Đáp án đúng: {getCorrectLabels(currentQuestion)}</span>
          </div>
        ) : null}

        {answered && currentQuestion.explanation ? (
          <div className="mt-4 rounded-md border border-line bg-canvas p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Explanation</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{currentQuestion.explanation}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button className="w-full sm:w-auto" disabled={session.currentIndex === 0} onClick={() => goTo(session.currentIndex - 1)}>
            <ArrowLeft size={16} /> Câu trước
          </Button>
          <Button className="w-full sm:w-auto" disabled={session.currentIndex === session.questionIds.length - 1} onClick={() => goTo(session.currentIndex + 1)} variant="primary">
            Câu tiếp theo <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <aside className="rounded-md border border-line bg-panel p-4">
        <p className="text-sm font-bold">Danh sách câu</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {session.questionIds.map((questionId, index) => {
            const question = questionById.get(questionId);
            const state = session.answers[questionId];
            return (
              <button
                key={questionId}
                className={`flex h-10 items-center justify-center rounded-md border text-sm font-bold ${
                  index === session.currentIndex
                    ? 'border-accent bg-accent/12 text-accent'
                    : state?.isCorrect
                      ? 'border-success bg-success/10 text-success'
                      : state
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-line bg-canvas text-muted'
                }`}
                title={question?.question}
                onClick={() => goTo(index)}
              >
                {state?.isCorrect ? <CheckCircle2 size={16} /> : state ? <XCircle size={16} /> : <Circle size={15} />}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted">
          <p>Chưa làm: {session.questionIds.length - Object.keys(session.answers).length}</p>
          <p>Đúng: {Object.values(session.answers).filter((item) => item.isCorrect).length}</p>
          <p>Sai: {Object.values(session.answers).filter((item) => !item.isCorrect).length}</p>
        </div>
      </aside>
    </div>
  );
}
