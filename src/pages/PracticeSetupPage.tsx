import { Play } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { buildPracticeSession } from '../hooks/usePracticeSession';
import { loadStats, saveActiveSession } from '../services/storage';
import type { PracticeConfig } from '../types/swr302';
import { getChapters, getTopics, validPracticeQuestions } from '../utils/data';

const counts: Array<PracticeConfig['questionCount']> = [10, 20, 30, 50, 'all'];

export function PracticeSetupPage() {
  const navigate = useNavigate();
  const stats = loadStats();
  const chapters = getChapters();
  const topics = getTopics();
  const [config, setConfig] = useState<PracticeConfig>({
    mode: 'all',
    chapter: '',
    topic: '',
    questionCount: 10,
    shuffleQuestions: stats.shuffleQuestions,
    shuffleAnswers: stats.shuffleAnswers,
    instantFeedback: true
  });

  const canStart = validPracticeQuestions.length > 0;

  function update<K extends keyof PracticeConfig>(key: K, value: PracticeConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  function start() {
    const session = buildPracticeSession(config);
    saveActiveSession(session);
    navigate('/practice');
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Cấu hình bài luyện tập</h1>
        <p className="mt-1 text-sm text-muted">Chỉ câu hỏi có đáp án đúng rõ ràng và không cần review mới được đưa vào bài.</p>
      </div>

      <div className="rounded-md border border-line bg-panel p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold">Chế độ</span>
            <select className="h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm" value={config.mode} onChange={(event) => update('mode', event.target.value as PracticeConfig['mode'])}>
              <option value="all">Luyện tất cả câu</option>
              <option value="chapter">Luyện theo chương</option>
              <option value="topic">Luyện theo chủ đề</option>
              <option value="wrong">Chỉ luyện câu đã sai</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Số lượng câu</span>
            <select className="h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm" value={String(config.questionCount)} onChange={(event) => update('questionCount', event.target.value === 'all' ? 'all' : Number(event.target.value))}>
              {counts.map((count) => <option key={String(count)} value={String(count)}>{count === 'all' ? 'Tất cả câu' : `${count} câu`}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Chương</span>
            <select className="h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm" value={config.chapter} disabled={config.mode !== 'chapter'} onChange={(event) => update('chapter', event.target.value)}>
              <option value="">Chọn chương</option>
              {chapters.map((chapter) => <option key={chapter} value={chapter}>{chapter}</option>)}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold">Chủ đề</span>
            <select className="h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm" value={config.topic} disabled={config.mode !== 'topic'} onChange={(event) => update('topic', event.target.value)}>
              <option value="">Chọn chủ đề</option>
              {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ['shuffleQuestions', 'Xáo trộn câu hỏi'],
            ['shuffleAnswers', 'Xáo trộn đáp án'],
            ['instantFeedback', 'Hiển thị kết quả ngay']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between rounded-md border border-line bg-canvas px-3 py-3 text-sm font-semibold">
              {label}
              <input
                type="checkbox"
                className="size-5 accent-[oklch(var(--accent))]"
                checked={Boolean(config[key as keyof PracticeConfig])}
                onChange={(event) => update(key as keyof PracticeConfig, event.target.checked as never)}
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">{validPracticeQuestions.length} câu hỏi hợp lệ sẵn sàng luyện tập.</p>
          <Button variant="primary" disabled={!canStart} onClick={start}>
            <Play size={16} /> Bắt đầu
          </Button>
        </div>
      </div>
    </div>
  );
}

