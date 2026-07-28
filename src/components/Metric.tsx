import type { CSSProperties, ReactNode } from 'react';

type MetricTone = 'teal' | 'indigo' | 'emerald' | 'gold';

const toneStyles: Record<MetricTone, { aura: string; glow: string; icon: string; progress: string; statAccent: string }> = {
  teal: {
    aura: 'fx-icon-aura',
    glow: 'bg-tealPrimary/20 dark:bg-tealPrimary/10',
    icon: 'bg-tealPrimary/10 text-tealPrimary dark:bg-tealSoft/15 dark:text-tealHover',
    progress: 'bg-tealPrimary',
    statAccent: 'rgba(34, 230, 210, 0.16)'
  },
  indigo: {
    aura: 'fx-icon-aura',
    glow: 'bg-[oklch(0.55_0.11_220/0.16)] dark:bg-tealPrimary/10',
    icon: 'bg-[oklch(0.55_0.11_220/0.12)] text-[oklch(0.45_0.1_220)] dark:bg-bgSurfaceSoft/65 dark:text-textSecondary',
    progress: 'bg-[oklch(0.55_0.11_220)]',
    statAccent: 'rgba(56, 217, 255, 0.14)'
  },
  emerald: {
    aura: 'fx-icon-aura--green',
    glow: 'bg-emerald/20 dark:bg-emerald/10',
    icon: 'bg-emerald/10 text-emerald dark:bg-emerald/15 dark:text-emerald',
    progress: 'bg-emerald',
    statAccent: 'rgba(74, 222, 128, 0.14)'
  },
  gold: {
    aura: 'fx-icon-aura--gold',
    glow: 'bg-gold/20 dark:bg-goldPrimary/10',
    icon: 'bg-gold/15 text-[oklch(0.56_0.12_78)] dark:bg-goldSoft/10 dark:text-goldPrimary',
    progress: 'bg-gold',
    statAccent: 'rgba(247, 201, 72, 0.15)'
  }
};

export function Metric({
  detail,
  icon,
  label,
  progress,
  tone = 'teal',
  value
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
  tone?: MetricTone;
  progress?: number;
}) {
  const styles = toneStyles[tone];
  const normalizedProgress = typeof progress === 'number' ? Math.max(0, Math.min(100, progress)) : null;
  const statStyle = { '--stat-accent': styles.statAccent } as CSSProperties;

  return (
    <div
      className="fx-glass fx-glow-border fx-stat-card group relative overflow-hidden rounded-[24px] border border-mint/55 bg-panel/70 p-4 shadow-card backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-tealPrimary/35 dark:border-borderSubtle/65 dark:bg-bgSurfaceElevated/75 dark:hover:border-borderStrong/70"
      style={statStyle}
    >
      <span className={`pointer-events-none absolute -right-10 -top-10 size-28 rounded-full blur-2xl ${styles.glow}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-3 text-3xl font-black leading-none text-textPrimary">{value}</p>
          {detail ? <p className="mt-2 text-sm leading-5 text-textSecondary">{detail}</p> : null}
        </div>
        {icon ? (
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border border-mint/45 dark:border-borderSubtle/55 ${styles.aura} ${styles.icon}`}>
            {icon}
          </div>
        ) : null}
      </div>
      {normalizedProgress !== null ? (
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-mint/45 dark:bg-bgSurfaceSoft/80">
          <span className={`block h-full rounded-full ${styles.progress}`} style={{ width: `${normalizedProgress}%` }} />
        </div>
      ) : null}
    </div>
  );
}
