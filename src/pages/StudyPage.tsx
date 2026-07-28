import { ArrowLeft, ArrowRight, CheckCircle2, Image as ImageIcon, ListChecks, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import type { QuizQuestion } from '../types/swr302';
import { getCorrectLabels, getCorrectOptionIds } from '../utils/answers';
import { getChapters, getTopics, sourceImageUrl, validPracticeQuestions } from '../utils/data';

function matchesQuestion(question: QuizQuestion, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    question.id,
    question.question,
    question.chapter,
    question.topic,
    question.explanation,
    question.sourceImages.join(' '),
    ...question.options.map((option) => `${option.originalLabel} ${option.text}`)
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}

export function StudyPage() {
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const chapters = getChapters();
  const topics = getTopics();

  const filteredQuestions = useMemo(() => {
    return validPracticeQuestions.filter((question) => {
      return (
        matchesQuestion(question, query) &&
        (!chapter || question.chapter === chapter) &&
        (!topic || question.topic === topic)
      );
    });
  }, [chapter, query, topic]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [chapter, query, topic]);

  const safeIndex = Math.min(currentIndex, Math.max(filteredQuestions.length - 1, 0));
  const currentQuestion = filteredQuestions[safeIndex];
  const correctOptionIds = currentQuestion ? new Set(getCorrectOptionIds(currentQuestion)) : new Set<string>();
  const sourceImage = currentQuestion?.sourceImages[0];
  const hasExplanation = Boolean(currentQuestion?.explanation.trim());

  function goToQuestion(index: number) {
    setCurrentIndex(Math.min(Math.max(index, 0), Math.max(filteredQuestions.length - 1, 0)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chế độ học bài</h1>
          <p className="mt-1 text-sm text-muted">
            Xem ảnh câu hỏi gốc, đáp án đúng và phần giải thích để ôn trước khi luyện tập.
          </p>
        </div>
        <p className="text-sm font-semibold text-muted">
          {filteredQuestions.length} / {validPracticeQuestions.length} câu
        </p>
      </div>

      <div className="grid gap-3 rounded-md border border-line bg-panel p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            className="h-11 w-full rounded-md border border-line bg-canvas pl-9 pr-3 text-sm"
            placeholder="Tìm câu hỏi, đáp án, giải thích, tên ảnh"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select
          className="h-11 rounded-md border border-line bg-canvas px-3 text-sm"
          value={chapter}
          onChange={(event) => setChapter(event.target.value)}
        >
          <option value="">Tất cả chương</option>
          {chapters.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-md border border-line bg-canvas px-3 text-sm"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        >
          <option value="">Tất cả chủ đề</option>
          {topics.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {!currentQuestion ? (
        <section className="rounded-md border border-warning/35 bg-warning/10 p-5">
          <h2 className="text-lg font-bold">Không tìm thấy câu phù hợp</h2>
          <p className="mt-2 text-sm text-muted">Thử bỏ bớt bộ lọc hoặc nhập từ khóa khác.</p>
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <section className="rounded-md border border-line bg-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted">
                    Câu {safeIndex + 1} / {filteredQuestions.length}
                  </p>
                  <p className="mt-1 text-xs text-muted">Source: {currentQuestion.sourceImages.join(', ')}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    className="w-full sm:w-auto sm:px-3"
                    disabled={safeIndex === 0}
                    onClick={() => goToQuestion(safeIndex - 1)}
                  >
                    <ArrowLeft size={16} /> Câu trước
                  </Button>
                  <Button
                    className="w-full sm:w-auto sm:px-3"
                    disabled={safeIndex === filteredQuestions.length - 1}
                    onClick={() => goToQuestion(safeIndex + 1)}
                    variant="primary"
                  >
                    Câu tiếp <ArrowRight size={16} />
                  </Button>
                  <div className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-canvas px-3 py-2 text-sm font-semibold text-muted">
                    <ImageIcon size={16} />
                    Ảnh câu hỏi
                  </div>
                </div>
              </div>

              {sourceImage ? (
                <img
                  src={sourceImageUrl(sourceImage)}
                  alt={`Source ${sourceImage}`}
                  className="mt-4 aspect-video w-full rounded-md border border-line bg-panel2 object-contain"
                />
              ) : (
                <div className="mt-4 flex aspect-video items-center justify-center rounded-md border border-line bg-panel2 text-sm text-muted">
                  Không có ảnh nguồn
                </div>
              )}
            </section>

            <section className="rounded-md border border-line bg-panel p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Câu hỏi OCR</p>
                  <h2 className="mt-2 whitespace-pre-wrap text-xl font-bold leading-8">{currentQuestion.question}</h2>
                </div>
                <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-success/10 px-3 py-2 text-sm font-semibold text-success sm:w-auto">
                  <CheckCircle2 size={16} />
                  Đáp án đúng: {getCorrectLabels(currentQuestion)}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isCorrect = correctOptionIds.has(option.id);
                  return (
                    <div
                      key={option.id}
                      className={`rounded-md border p-3 ${
                        isCorrect ? 'border-success bg-success/10 text-ink' : 'border-line bg-canvas text-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${
                            isCorrect ? 'border-success bg-success text-accentInk' : 'border-line bg-panel text-ink'
                          }`}
                        >
                          {option.originalLabel}
                        </span>
                        <p className="min-w-0 whitespace-pre-wrap text-sm leading-6">
                          {option.text || 'Chưa đọc được nội dung đáp án.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-md border border-line bg-canvas p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Giải thích</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                  {hasExplanation
                    ? currentQuestion.explanation
                    : 'Chưa có giải thích chi tiết trong dữ liệu. Đáp án đúng đã được xác nhận từ ghi chú slide.'}
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button className="w-full sm:w-auto" disabled={safeIndex === 0} onClick={() => goToQuestion(safeIndex - 1)}>
                <ArrowLeft size={16} /> Câu trước
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={safeIndex === filteredQuestions.length - 1}
                onClick={() => goToQuestion(safeIndex + 1)}
                variant="primary"
              >
                Câu tiếp theo <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <aside className="rounded-md border border-line bg-panel p-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto thin-scrollbar">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">Danh sách câu</p>
                <p className="mt-1 text-xs text-muted">Bấm số để nhảy nhanh.</p>
              </div>
              <ListChecks className="text-muted" size={18} />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {filteredQuestions.map((question, index) => {
                const explained = Boolean(question.explanation.trim());
                return (
                  <button
                    key={question.id}
                    className={`flex h-10 items-center justify-center rounded-md border text-sm font-bold transition-colors ${
                      index === safeIndex
                        ? 'border-accent bg-accent/12 text-accent'
                        : explained
                          ? 'border-line bg-canvas text-ink hover:border-accent/60'
                          : 'border-line bg-canvas text-muted hover:border-accent/60'
                    }`}
                    title={question.question}
                    onClick={() => goToQuestion(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
