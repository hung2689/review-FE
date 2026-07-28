import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { sourceImageUrl, materials, getChapters, getTopics } from '../utils/data';

export function MaterialsPage() {
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const chapters = getChapters();
  const topics = getTopics();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return materials.filter((material) => {
      const matchesQuery =
        !needle ||
        material.title.toLowerCase().includes(needle) ||
        material.originalContent.toLowerCase().includes(needle) ||
        material.sourceImages.join(' ').toLowerCase().includes(needle);
      return matchesQuery && (!chapter || material.chapter === chapter) && (!topic || material.topic === topic);
    });
  }, [chapter, query, topic]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tài liệu SWR302</h1>
          <p className="mt-1 text-sm text-muted">Nội dung OCR nguyên văn từ ảnh, kèm tên ảnh nguồn.</p>
        </div>
        <p className="text-sm font-semibold text-muted">{filtered.length} / {materials.length} mục</p>
      </div>

      <div className="grid gap-3 rounded-md border border-line bg-panel p-4 md:grid-cols-[1fr_220px_220px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            className="h-11 w-full rounded-md border border-line bg-canvas pl-9 pr-3 text-sm"
            placeholder="Tìm nội dung, tiêu đề, tên ảnh"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="h-11 rounded-md border border-line bg-canvas px-3 text-sm" value={chapter} onChange={(event) => setChapter(event.target.value)}>
          <option value="">Tất cả chương</option>
          {chapters.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="h-11 rounded-md border border-line bg-canvas px-3 text-sm" value={topic} onChange={(event) => setTopic(event.target.value)}>
          <option value="">Tất cả chủ đề</option>
          {topics.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((material) => (
          <article key={material.id} className="rounded-md border border-line bg-panel p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold">{material.title}</h2>
                  {material.needsReview ? <span className="rounded-md bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">needs review</span> : null}
                </div>
                <p className="mt-1 text-xs text-muted">Source: {material.sourceImages.join(', ')}</p>
                <pre className="mt-4 whitespace-pre-wrap rounded-md border border-line bg-canvas p-3 text-sm leading-6 text-ink">{material.originalContent}</pre>
              </div>
              {material.sourceImages[0] ? (
                <img
                  src={sourceImageUrl(material.sourceImages[0])}
                  alt={material.sourceImages[0]}
                  className="aspect-video w-full rounded-md border border-line object-contain lg:w-80"
                />
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

