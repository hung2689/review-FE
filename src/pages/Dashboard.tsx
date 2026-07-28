import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Database,
  FileCheck2,
  Image as ImageIcon,
  Layers3,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Metric } from '../components/Metric';
import { loadStats } from '../services/storage';
import type { QuizQuestion } from '../types/swr302';
import { getStats, questions, reviewQuestions, sourceImageUrl, validPracticeQuestions } from '../utils/data';

type FeatureItem = {
  icon: LucideIcon;
  label: string;
};

type CreatorAction = {
  icon: LucideIcon;
  subtitle: string;
  title: string;
  to: string;
  tone: 'teal' | 'green' | 'gold';
};

const heroBenefits: FeatureItem[] = [
  { icon: ShieldCheck, label: 'Giữ nguyên nội dung gốc' },
  { icon: BadgeCheck, label: 'Không tự suy đoán đáp án' },
  { icon: FileCheck2, label: 'Review dữ liệu chưa chắc chắn' }
];

const creatorTags: FeatureItem[] = [
  { label: 'OCR', icon: Code2 },
  { label: 'Quiz Practice', icon: ClipboardCheck },
  { label: 'Answer Review', icon: CheckCircle2 },
  { label: 'Study Smarter', icon: Sparkles }
];

const creatorActions: CreatorAction[] = [
  {
    to: '/study',
    title: 'Source images',
    subtitle: 'Xem slide gốc',
    icon: ImageIcon,
    tone: 'teal'
  },
  {
    to: '/study',
    title: 'Answer review',
    subtitle: 'Xem đáp án & giải thích',
    icon: BadgeCheck,
    tone: 'green'
  },
  {
    to: '/practice/setup',
    title: 'Study mode',
    subtitle: 'Luyện tập ngay',
    icon: BookOpen,
    tone: 'gold'
  }
];

export function Dashboard() {
  const reduceMotion = useReducedMotion();
  const stored = loadStats();
  const stats = getStats(stored.answeredQuestionIds.length, stored.correctRate);
  const sampleQuestion = questions[0] ?? reviewQuestions[0];
  const sampleImage = sampleQuestion?.sourceImages[0] ?? reviewQuestions[0]?.sourceImages[0] ?? 'slide_001.png';

  return (
    <div className="space-y-6">
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fx-glass fx-glow-border fx-card-glow fx-gold-corner relative overflow-hidden rounded-[32px] border border-mint/55 bg-[linear-gradient(135deg,oklch(var(--panel)/0.9),oklch(var(--color-mint)/0.55)_54%,oklch(var(--color-teal-primary)/0.16))] p-4 shadow-card backdrop-blur dark:border-borderSubtle/70 dark:bg-[linear-gradient(135deg,oklch(var(--bg-surface-elevated)/0.94),oklch(var(--bg-surface)/0.9)_52%,oklch(var(--color-teal-dark)/0.38))] dark:shadow-[0_26px_80px_oklch(0.05_0.02_190/0.48)] sm:p-6 dark:lg:p-6 lg:p-7"
      >
        <span className="fx-sparkle right-10 top-10 hidden dark:block">
          <span className="fx-sparkle-dot" />
        </span>
        <span className="fx-sparkle bottom-24 right-[42%] hidden [animation-delay:1.1s] dark:block">
          <span className="fx-sparkle-dot" />
        </span>
        <span className="fx-dot-pattern left-10 top-12 hidden dark:block" />
        <span className="fx-curve hidden dark:block" />
        <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-tealPrimary/20 blur-3xl dark:bg-tealPrimary/10" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 size-80 rounded-full bg-mint/40 blur-3xl dark:bg-bgSurfaceSoft/45" />
        <div className="pointer-events-none absolute -right-20 top-16 size-72 rounded-full bg-gold/20 blur-3xl dark:bg-goldPrimary/10" />
        <div className="pointer-events-none absolute right-14 top-12 hidden h-36 w-56 rounded-full border border-white/45 dark:border-borderSubtle/20 lg:block" />
        <div className="pointer-events-none absolute left-8 top-8 hidden grid-cols-7 gap-3 opacity-25 dark:opacity-15 lg:grid">
          {Array.from({ length: 28 }).map((_, index) => (
            <span key={index} className="size-1 rounded-full bg-tealPrimary" />
          ))}
        </div>

        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center py-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/45 bg-panel/60 px-4 py-2 text-xs font-black uppercase tracking-wide text-[oklch(0.54_0.12_78)] shadow-sm backdrop-blur dark:border-goldPrimary/35 dark:bg-goldSoft/10 dark:text-goldPrimary">
              <Sparkles size={15} />
              AI-assisted practice hub
            </span>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-textPrimary md:text-5xl">
              Học bài, kiểm tra <span className="text-tealPrimary dark:text-tealHover">OCR</span>,{' '}
              <span className="text-tealDark dark:text-tealPrimary">luyện tập</span> câu hỏi đã có{' '}
              <span className="text-[oklch(0.54_0.12_78)] dark:text-goldPrimary">đáp án rõ ràng</span>.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-textSecondary">
              App giữ nguyên nội dung trích xuất từ ảnh, không tự đoán đáp án. Câu chưa chắc chắn được đưa vào khu vực review
              trước khi tham gia chế độ luyện tập chính thức.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {heroBenefits.map((benefit) => (
                <FeatureChip key={benefit.label} item={benefit} />
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <HeroActionLink icon={ArrowRight} label="Bắt đầu luyện tập" to="/practice/setup" variant="primary" />
              <HeroActionLink icon={BookMarked} label="Học bài" to="/study" />
              <HeroActionLink icon={RotateCcw} label="Luyện câu đã sai" to="/wrong" />
            </div>
          </div>

          <SourcePreviewCard fileName={sampleImage} question={sampleQuestion} />
        </div>
      </motion.section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          detail={`${stats.reviewQuestionCount} cần review`}
          icon={<CheckCircle2 size={22} />}
          label="Câu hỏi hợp lệ"
          tone="teal"
          value={stats.validQuestionCount}
        />
        <Metric
          detail="Nội dung đã nhập"
          icon={<Layers3 size={22} />}
          label="Tổng chương"
          tone="indigo"
          value={stats.chapterCount}
        />
        <Metric
          detail="Câu đã hoàn thành"
          icon={<Target size={22} />}
          label="Đã luyện tập"
          tone="emerald"
          value={stats.practicedCount}
        />
        <Metric
          detail="Độ chính xác hiện tại"
          icon={<Trophy size={22} />}
          label="Tỷ lệ đúng"
          progress={stats.correctRate}
          tone="gold"
          value={`${stats.correctRate}%`}
        />
      </section>

      <CreatorSpotlight />

      {validPracticeQuestions.length === 0 ? (
        <section className="rounded-[24px] border border-warning/35 bg-warning/10 p-4 text-sm leading-6 shadow-card">
          Chưa có câu hỏi nào đủ điều kiện luyện tập chính thức. Hãy chạy scan và mở trang{' '}
          <Link className="font-semibold text-accent" to="/data-review">
            Data review
          </Link>{' '}
          để xác nhận đáp án đúng thủ công.
        </section>
      ) : null}
    </div>
  );
}

function HeroActionLink({
  icon: Icon,
  label,
  to,
  variant = 'glass'
}: {
  icon: LucideIcon;
  label: string;
  to: string;
  variant?: 'primary' | 'glass';
}) {
  const variantClass =
    variant === 'primary'
      ? 'fx-primary-glow border-transparent bg-gradient-to-r from-tealPrimary to-emerald text-accentInk shadow-glow hover:shadow-[0_20px_44px_oklch(var(--color-teal-primary)/0.32)] dark:from-tealPrimary dark:to-tealHover dark:text-bgPage dark:shadow-[0_0_34px_oklch(var(--teal-primary)/0.2)]'
      : 'border-mint/65 bg-panel/55 text-ink shadow-sm backdrop-blur hover:bg-mint/35 dark:border-borderStrong/45 dark:bg-bgSurfaceElevated/70 dark:text-textPrimary dark:hover:bg-bgSurfaceSoft/80';

  return (
    <Link
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition-all duration-200 hover:-translate-y-1 ${variantClass}`}
      to={to}
    >
      <Icon size={18} className={variant === 'primary' ? 'order-2 transition-transform group-hover:translate-x-1' : undefined} />
      <span>{label}</span>
    </Link>
  );
}

function SourcePreviewCard({ fileName, question }: { fileName: string; question?: QuizQuestion }) {
  const chapter = question?.chapter || 'Chưa phân chương';
  const questionNumber = question?.id || fileName;

  return (
    <div className="fx-glass fx-glow-border fx-source-card relative overflow-hidden rounded-[28px] border border-white/55 bg-panel/50 p-4 shadow-[inset_0_1px_0_oklch(1_0_0/0.45),0_18px_44px_oklch(0.2_0.035_205/0.16)] backdrop-blur-xl dark:border-borderSubtle/75 dark:bg-bgSurfaceElevated/75 dark:shadow-[inset_0_1px_0_oklch(var(--border-strong)/0.12),0_22px_58px_oklch(0.04_0.018_190/0.46)] lg:dark:p-3">
      <span className="fx-sparkle right-6 top-6 hidden scale-75 [animation-delay:1.7s] dark:block">
        <span className="fx-sparkle-dot" />
      </span>
      <span className="fx-dot-pattern bottom-4 right-8 hidden opacity-25 dark:block" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-tealPrimary/15 blur-3xl dark:bg-tealPrimary/10" />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-sm font-black text-textPrimary">
            <ScanLine size={17} className="text-tealPrimary" />
            Live source preview
            <span className="rounded-full border border-gold/45 bg-gold/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-[oklch(0.54_0.12_78)] dark:border-goldPrimary/30 dark:bg-goldSoft/10 dark:text-goldPrimary">
              Original slide
            </span>
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-mint/60 bg-panel/55 px-3 py-2 text-xs font-bold text-tealPrimary transition-all duration-200 hover:-translate-y-0.5 hover:bg-mint/35 dark:border-borderStrong/45 dark:bg-bgSurface/70 dark:text-tealHover dark:hover:bg-bgSurfaceSoft/85"
          to="/data-review"
        >
          Review data
          <Database size={14} />
        </Link>
      </div>

      <div className="fx-preview-frame relative z-10 mt-4 overflow-hidden rounded-[22px] border border-tealPrimary/20 bg-[oklch(0.2_0.035_190/0.06)] p-3 shadow-[0_18px_44px_oklch(var(--color-teal-primary)/0.16)] dark:border-borderStrong/35 dark:bg-[oklch(var(--bg-page)/0.45)] dark:shadow-[0_18px_44px_oklch(var(--teal-primary)/0.14)]">
        <img
          src={sourceImageUrl(fileName)}
          alt={`Source ${fileName}`}
          className="aspect-video w-full rounded-2xl border border-white/45 bg-panel/85 object-contain dark:border-borderSubtle/65 dark:bg-bgSurface/85"
        />
      </div>

      <div className="relative z-10 mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <PreviewMeta label="Source image" value={fileName} />
        <PreviewMeta label="Chapter" value={chapter} />
        <PreviewMeta label="Question number" value={questionNumber} />
      </div>
    </div>
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-mint/45 bg-panel/48 px-3 py-2 backdrop-blur dark:border-borderSubtle/55 dark:bg-bgSurface/58">
      <p className="font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 truncate font-semibold text-textPrimary">{value}</p>
    </div>
  );
}

function FeatureChip({ item }: { item: FeatureItem }) {
  const Icon = item.icon;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-mint/60 bg-panel/45 px-4 py-2 text-sm font-semibold text-tealDark shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-mint/40 dark:border-borderStrong/45 dark:bg-bgSurfaceElevated/70 dark:text-textSecondary dark:hover:bg-bgSurfaceSoft/80 dark:hover:text-textPrimary">
      <Icon size={15} />
      {item.label}
    </span>
  );
}

function CreatorSpotlight() {
  return (
    <section className="fx-glass fx-glow-border fx-card-glow fx-gold-corner relative overflow-hidden rounded-[28px] border border-white/45 bg-[linear-gradient(135deg,oklch(0.45_0.12_186),oklch(0.83_0.08_168)_56%,oklch(0.66_0.11_174))] p-4 shadow-[0_22px_70px_oklch(0.28_0.05_190/0.22)] dark:border-borderSubtle/65 dark:bg-[linear-gradient(135deg,oklch(0.19_0.055_188),oklch(0.28_0.07_184)_54%,oklch(0.2_0.05_175))] dark:shadow-[0_28px_82px_oklch(0.04_0.018_190/0.5)] md:p-6">
      <span className="fx-sparkle right-10 top-8 hidden [animation-delay:0.8s] dark:block">
        <span className="fx-sparkle-dot" />
      </span>
      <span className="fx-dot-pattern right-96 top-20 hidden dark:block" />
      <span className="fx-curve hidden dark:block" />
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/20 blur-3xl dark:bg-tealPrimary/10" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 size-96 rounded-full bg-accent/25 blur-3xl dark:bg-tealPrimary/15" />
      <div className="pointer-events-none absolute right-8 top-8 hidden h-32 w-44 rounded-full border border-white/30 dark:border-borderSubtle/20 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full border border-white/25 opacity-70 dark:border-borderSubtle/15" />
      <div className="pointer-events-none absolute right-20 top-24 hidden grid-cols-6 gap-3 opacity-40 dark:opacity-18 lg:grid">
        {Array.from({ length: 24 }).map((_, index) => (
          <span key={index} className="size-1 rounded-full bg-white" />
        ))}
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[0.95fr_1.9fr_0.95fr] lg:items-center">
        <div className="flex justify-center lg:justify-start">
          <div className="fx-avatar-orbit relative">
            <div className="absolute -inset-5 rounded-[46%] border border-white/35 dark:border-borderStrong/30" />
            <div className="absolute -inset-3 rounded-[44%] bg-accent/25 blur-xl" />
            <div className="relative rounded-[44%] border-[7px] border-white bg-white p-1 shadow-[0_18px_45px_oklch(0.2_0.04_190/0.24)] dark:border-bgSurfaceElevated dark:bg-bgSurfaceElevated dark:shadow-[0_20px_52px_oklch(0.04_0.018_190/0.45)]">
              <div className="rounded-[42%] border-4 border-[#f4d987] bg-[#f4d987]/40 p-1">
                <img
                  src="/builder-tony.jpg"
                  alt="Phạm Duy Hưng"
                  className="aspect-square w-56 rounded-[40%] object-cover object-[47%_54%] sm:w-64 lg:w-full"
                />
              </div>
            </div>
            <div className="absolute -bottom-3 -right-2 flex size-24 flex-col items-center justify-center rounded-full border-[3px] border-[#f4d987] bg-[oklch(0.32_0.1_184)] text-center text-[11px] font-bold leading-tight text-[#f9df91] shadow-[0_10px_35px_oklch(0.2_0.05_180/0.35)] sm:-right-4 sm:size-28">
              <span aria-hidden className="absolute left-3 top-8 flex -rotate-12 flex-col gap-1">
                {[0, 1, 2, 3].map((leaf) => (
                  <span key={leaf} className="block h-2 w-1.5 rounded-full bg-[#f4d987] opacity-90" />
                ))}
              </span>
              <span aria-hidden className="absolute right-3 top-8 flex rotate-12 flex-col gap-1">
                {[0, 1, 2, 3].map((leaf) => (
                  <span key={leaf} className="block h-2 w-1.5 rounded-full bg-[#f4d987] opacity-90" />
                ))}
              </span>
              <Award size={24} className="mb-1" />
              <span>FOUNDER</span>
              <span>CREATOR</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 text-ink dark:text-textPrimary">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f5d987]/60 bg-white/55 px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#b07800] shadow-sm backdrop-blur dark:border-goldPrimary/40 dark:bg-goldSoft/10 dark:text-goldPrimary">
              ★ BUILDER SPOTLIGHT
            </span>
            <span className="inline-flex w-fit items-center gap-2 text-sm font-semibold italic text-[oklch(0.42_0.08_184)] dark:text-textSecondary">
              <Sparkles size={15} /> Built for SWR302 learners
            </span>
          </div>

          <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-[oklch(0.22_0.06_190)] dark:text-textPrimary md:text-5xl">
            Phạm Duy Hưng
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 text-xl font-extrabold text-accent md:text-2xl">
            Creator of SWR302 Practice Hub
            <BadgeCheck size={22} className="text-accent" fill="oklch(var(--accent) / 0.16)" />
          </p>

          <div className="relative mt-5 max-w-3xl rounded-[22px] border border-white/35 bg-white/25 p-4 text-sm leading-7 text-[oklch(0.28_0.035_220)] shadow-sm backdrop-blur dark:border-borderSubtle/35 dark:bg-bgSurfaceElevated/34 dark:text-textSecondary">
            <span className="absolute -left-2 -top-5 text-5xl font-black leading-none text-[#f5d987]">“</span>
            <p>Mình xây dựng ứng dụng này để giúp bạn học hiệu quả hơn mỗi ngày.</p>
            <p className="mt-3">
              Từ trích xuất slide bằng OCR, luyện tập câu hỏi, kiểm tra đáp án cho đến xem lại những câu sai – tất cả được thiết
              kế để bạn nắm chắc kiến thức, tiết kiệm thời gian và tự tin hơn trong mỗi kỳ thi.
            </p>
            <span className="absolute -bottom-8 right-4 text-5xl font-black leading-none text-[#f5d987]">”</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {creatorTags.map((tag) => (
              <FeatureChip key={tag.label} item={tag} />
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/45 bg-white/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_18px_40px_oklch(0.25_0.04_190/0.16)] backdrop-blur-md dark:border-borderSubtle/45 dark:bg-bgSurfaceElevated/30 dark:shadow-[inset_0_1px_0_oklch(var(--border-strong)/0.12),0_20px_48px_oklch(0.04_0.018_190/0.36)]">
          <div className="grid gap-3">
            {creatorActions.map((action) => (
              <CreatorActionButton action={action} key={action.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CreatorActionButton({ action }: { action: CreatorAction }) {
  const Icon = action.icon;
  const toneClass = {
    teal: 'from-[oklch(0.47_0.14_188)] to-[oklch(0.72_0.1_188)] text-accentInk dark:from-tealPrimary dark:to-tealHover dark:text-bgPage',
    green: 'from-[oklch(0.47_0.13_145)] to-[oklch(0.72_0.12_142)] text-accentInk dark:from-emerald dark:to-[oklch(0.8_0.13_152)] dark:text-bgPage',
    gold: 'from-[oklch(0.62_0.14_74)] to-[oklch(0.82_0.16_86)] text-[oklch(0.22_0.055_78)] dark:from-goldPrimary dark:to-[oklch(0.9_0.13_88)] dark:text-bgPage'
  }[action.tone];
  const glowClass = {
    teal: 'fx-action-button',
    green: 'fx-action-button fx-action-button--green',
    gold: 'fx-action-button fx-action-button--gold'
  }[action.tone];

  return (
    <Link
      className={`${glowClass} group flex min-h-20 items-center gap-3 rounded-[20px] border border-white/45 bg-gradient-to-br ${toneClass} px-4 py-3 shadow-[0_12px_35px_oklch(0.18_0.04_180/0.22)] transition-transform hover:-translate-y-1 hover:shadow-[0_18px_45px_oklch(0.18_0.04_180/0.3)] dark:border-borderSubtle/30`}
      to={action.to}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/20 dark:border-white/30 dark:bg-white/15">
        <Icon size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold leading-tight">{action.title}</span>
        <span className="mt-1 block text-sm font-semibold leading-tight opacity-90">{action.subtitle}</span>
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-white/20 transition-transform group-hover:translate-x-1 dark:border-white/30 dark:bg-white/15">
        <ArrowRight size={20} />
      </span>
    </Link>
  );
}
