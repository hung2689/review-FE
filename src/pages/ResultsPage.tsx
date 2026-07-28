import { Home, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { loadStats } from '../services/storage';
import { questions } from '../utils/data';

export function ResultsPage() {
  const session = loadStats().lastCompletedSession;
  const questionById = new Map(questions.map((question) => [question.id, question]));

  if (!session) {
    return (
      <div className="mx-auto max-w-xl rounded-md border border-line bg-panel p-6 text-center">
        <h1 className="text-xl font-bold">Chưa có kết quả</h1>
        <p className="mt-2 text-sm text-muted">Hoàn thành một bài luyện tập để xem thống kê.</p>
        <Link to="/practice/setup" className="mt-5 inline-block">
          <Button variant="primary">Tạo bài luyện tập</Button>
        </Link>
      </div>
    );
  }

  const answers = Object.values(session.answers);
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const wrong = answers.length - correct;
  const rate = answers.length ? Math.round((correct / answers.length) * 100) : 0;
  const wrongAnswers = answers.filter((answer) => !answer.isCorrect);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="rounded-md border border-line bg-panel p-6">
        <h1 className="text-2xl font-bold">Kết quả luyện tập</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <ResultMetric label="Tổng số câu" value={session.questionIds.length} />
          <ResultMetric label="Đúng" value={correct} />
          <ResultMetric label="Sai" value={wrong} />
          <ResultMetric label="Tỷ lệ đúng" value={`${rate}%`} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/practice/setup"><Button><RotateCcw size={16} /> Làm lại</Button></Link>
          <Link to="/wrong"><Button variant="primary">Chỉ luyện câu sai</Button></Link>
          <Link to="/"><Button><Home size={16} /> Trang chủ</Button></Link>
        </div>
      </section>

      <section className="rounded-md border border-line bg-panel p-5">
        <h2 className="text-lg font-bold">Danh sách câu trả lời sai</h2>
        {wrongAnswers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Không có câu sai trong bài này.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {wrongAnswers.map((answer) => {
              const question = questionById.get(answer.questionId);
              return (
                <div key={answer.questionId} className="rounded-md border border-line bg-canvas p-3">
                  <p className="text-sm font-semibold">{question?.question ?? answer.questionId}</p>
                  <p className="mt-1 text-xs text-muted">Source: {question?.sourceImages.join(', ')}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-line bg-canvas p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

