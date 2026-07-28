import { RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { buildPracticeSession } from '../hooks/usePracticeSession';
import { loadStats, saveActiveSession } from '../services/storage';

export function WrongPracticePage() {
  const navigate = useNavigate();
  const stats = loadStats();
  const wrongCount = stats.wrongQuestionIds.length;

  function startWrongPractice() {
    const session = buildPracticeSession({
      mode: 'wrong',
      chapter: '',
      topic: '',
      questionCount: 'all',
      shuffleQuestions: true,
      shuffleAnswers: true,
      instantFeedback: true
    });
    saveActiveSession(session);
    navigate('/practice');
  }

  return (
    <div className="mx-auto max-w-2xl rounded-md border border-line bg-panel p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-12 items-center justify-center rounded-md bg-panel2">
          <RotateCcw size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Luyện câu đã sai</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Các câu sai được lưu trong trình duyệt này. Chỉ những câu có đáp án đúng rõ ràng mới được đưa vào lượt luyện lại.
          </p>
          <p className="mt-4 text-sm font-semibold">{wrongCount} câu đang nằm trong danh sách sai.</p>
          <Button className="mt-5" variant="primary" disabled={wrongCount === 0} onClick={startWrongPractice}>
            Bắt đầu luyện câu sai
          </Button>
        </div>
      </div>
    </div>
  );
}

