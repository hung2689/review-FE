import { Check, Save, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import {
  loadOverrides,
  makeMaterialOverride,
  makeQuestionOverride,
  saveOverride,
  type ReviewOverride
} from '../services/reviewOverrides';
import type { QuizQuestion, StudyMaterial } from '../types/swr302';
import { getCorrectOptionIds } from '../utils/answers';
import { materials, questions, sourceImageUrl } from '../utils/data';

type ReviewItem =
  | { kind: 'question'; item: QuizQuestion }
  | { kind: 'material'; item: StudyMaterial };

export function DataReviewPage() {
  const [query, setQuery] = useState('');
  const [overrides, setOverrides] = useState(loadOverrides);
  const reviewItems = useMemo<ReviewItem[]>(() => {
    const questionItems = questions
      .filter((question) => question.needsReview || getCorrectOptionIds(question).length === 0 || question.confidence < 70)
      .map((item) => ({ kind: 'question' as const, item }));
    const materialItems = materials
      .filter((material) => material.needsReview || material.confidence < 65)
      .map((item) => ({ kind: 'material' as const, item }));
    return [...questionItems, ...materialItems];
  }, []);

  const filtered = reviewItems.filter(({ item }) => {
    const text = 'question' in item ? item.question : item.originalContent;
    const source = item.sourceImages.join(' ');
    const needle = query.trim().toLowerCase();
    return !needle || text.toLowerCase().includes(needle) || source.toLowerCase().includes(needle) || item.id.toLowerCase().includes(needle);
  });

  function persist(override: ReviewOverride) {
    saveOverride(override);
    setOverrides(loadOverrides());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data review</h1>
          <p className="mt-1 text-sm text-muted">Kiểm tra OCR, chọn đáp án đúng thủ công và xác nhận nội dung trước khi luyện tập.</p>
        </div>
        <p className="text-sm font-semibold text-muted">{filtered.length} mục cần kiểm tra</p>
      </div>

      <label className="relative block rounded-md border border-line bg-panel p-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          className="h-11 w-full rounded-md border border-line bg-canvas pl-9 pr-3 text-sm"
          placeholder="Tìm theo nội dung, id hoặc tên ảnh"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="space-y-4">
        {filtered.map((entry) => {
          const override = overrides[entry.item.id];
          return entry.kind === 'question' ? (
            <QuestionReview key={entry.item.id} question={entry.item} override={override} onSave={persist} />
          ) : (
            <MaterialReview key={entry.item.id} material={entry.item} override={override} onSave={persist} />
          );
        })}
      </div>
    </div>
  );
}

function QuestionReview({
  question,
  override,
  onSave
}: {
  question: QuizQuestion;
  override?: ReviewOverride;
  onSave: (override: ReviewOverride) => void;
}) {
  const [text, setText] = useState(override?.correctedText ?? question.question);
  const initialCorrectOptionIds =
    override?.correctOptionIds?.length
      ? override.correctOptionIds
      : override?.correctOptionId
        ? [override.correctOptionId]
        : getCorrectOptionIds(question);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>(initialCorrectOptionIds);
  const [confirmed, setConfirmed] = useState(Boolean(override?.confirmed));
  const [rejectedDuplicate, setRejectedDuplicate] = useState(Boolean(override?.rejectedDuplicate));

  function toggleCorrectOption(optionId: string) {
    setCorrectOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((selectedId) => selectedId !== optionId)
        : [...current, optionId]
    );
  }

  return (
    <article className="rounded-md border border-line bg-panel p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold">{question.id}</h2>
            <span className="rounded-md bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">needs review</span>
            <span className="text-xs text-muted">confidence {question.confidence}</span>
          </div>
          <textarea
            className="mt-3 min-h-28 w-full rounded-md border border-line bg-canvas p-3 text-sm leading-6"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="mt-3 grid gap-2">
            {question.options.map((option) => (
              <label key={option.id} className="flex items-start gap-3 rounded-md border border-line bg-canvas p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[oklch(var(--accent))]"
                  checked={correctOptionIds.includes(option.id)}
                  onChange={() => toggleCorrectOption(option.id)}
                />
                <span><strong>{option.originalLabel}.</strong> {option.text}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="size-4 accent-[oklch(var(--accent))]" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
              Xác nhận hợp lệ
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="size-4 accent-[oklch(var(--danger))]" checked={rejectedDuplicate} onChange={(event) => setRejectedDuplicate(event.target.checked)} />
              Loại vì trùng
            </label>
          </div>
          <Button
            className="mt-4"
            variant="primary"
            onClick={() =>
              onSave(
                makeQuestionOverride(question, {
                  correctedText: text,
                  correctOptionId: correctOptionIds[0] ?? null,
                  correctOptionIds,
                  confirmed,
                  rejectedDuplicate
                })
              )
            }
          >
            <Save size={16} /> Lưu review
          </Button>
        </div>
        <SourcePreview sourceImages={question.sourceImages} />
      </div>
    </article>
  );
}

function MaterialReview({
  material,
  override,
  onSave
}: {
  material: StudyMaterial;
  override?: ReviewOverride;
  onSave: (override: ReviewOverride) => void;
}) {
  const [text, setText] = useState(override?.correctedText ?? material.originalContent);
  const [confirmed, setConfirmed] = useState(Boolean(override?.confirmed));

  return (
    <article className="rounded-md border border-line bg-panel p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold">{material.id}</h2>
            <span className="text-xs text-muted">confidence {material.confidence}</span>
          </div>
          <textarea
            className="mt-3 min-h-44 w-full rounded-md border border-line bg-canvas p-3 text-sm leading-6"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="size-4 accent-[oklch(var(--accent))]" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
            Xác nhận nội dung
          </label>
          <div>
            <Button className="mt-4" variant="primary" onClick={() => onSave(makeMaterialOverride(material, { correctedText: text, confirmed }))}>
              <Save size={16} /> Lưu review
            </Button>
          </div>
        </div>
        <SourcePreview sourceImages={material.sourceImages} />
      </div>
    </article>
  );
}

function SourcePreview({ sourceImages }: { sourceImages: string[] }) {
  return (
    <div className="space-y-3">
      {sourceImages.map((image) => (
        <div key={image}>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted">
            {image} {image ? <Check size={12} /> : <X size={12} />}
          </p>
          <img src={sourceImageUrl(image)} alt={image} className="aspect-video w-full rounded-md border border-line object-contain bg-canvas" />
        </div>
      ))}
    </div>
  );
}
