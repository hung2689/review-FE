import { motion } from 'framer-motion';
import { ArrowRight, BookMarked, BookOpen, Database, RotateCcw, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Metric } from '../components/Metric';
import { loadStats } from '../services/storage';
import { getStats, questions, reviewQuestions, sourceImageUrl, validPracticeQuestions } from '../utils/data';

export function Dashboard() {
  const stored = loadStats();
  const stats = getStats(stored.answeredQuestionIds.length, stored.correctRate);
  const sampleImage = questions[0]?.sourceImages[0] ?? reviewQuestions[0]?.sourceImages[0] ?? 'slide_001.png';

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-md border border-line bg-panel p-6 shadow-soft"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">SWR302 Practice Hub</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">
            Học tài liệu, kiểm tra OCR, luyện tập câu hỏi đã có đáp án rõ ràng.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            App giữ nguyên nội dung trích xuất từ ảnh, không tự đoán đáp án. Câu chưa chắc chắn được đưa vào khu vực review
            trước khi tham gia chế độ luyện tập chính thức.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/practice/setup">
              <Button variant="primary">
                Bắt đầu luyện tập <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/materials">
              <Button>
                <BookOpen size={16} /> Xem tài liệu
              </Button>
            </Link>
            <Link to="/study">
              <Button>
                <BookMarked size={16} /> Học bài
              </Button>
            </Link>
            <Link to="/wrong">
              <Button>
                <RotateCcw size={16} /> Luyện câu đã sai
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="rounded-md border border-line bg-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Source preview</p>
              <p className="text-xs text-muted">{sampleImage}</p>
            </div>
            <Link to="/data-review" className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              Review data <Database size={15} />
            </Link>
          </div>
          <img
            src={sourceImageUrl(sampleImage)}
            alt={`Source ${sampleImage}`}
            className="mt-4 aspect-video w-full rounded-md border border-line object-contain bg-panel2"
          />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Tổng tài liệu" value={stats.materialCount} />
        <Metric label="Câu hỏi hợp lệ" value={stats.validQuestionCount} detail={`${stats.reviewQuestionCount} cần review`} />
        <Metric label="Tổng chương" value={stats.chapterCount} />
        <Metric label="Đã luyện tập" value={stats.practicedCount} />
        <Metric label="Tỷ lệ đúng" value={`${stats.correctRate}%`} />
      </section>

      {validPracticeQuestions.length === 0 ? (
        <section className="rounded-md border border-warning/35 bg-warning/10 p-4 text-sm leading-6">
          Chưa có câu hỏi nào đủ điều kiện luyện tập chính thức. Hãy chạy scan và mở trang <Link className="font-semibold text-accent" to="/data-review">Data review</Link> để xác nhận đáp án đúng thủ công.
        </section>
      ) : null}
    </div>
  );
}
