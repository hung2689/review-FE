export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-panel2">
      <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

