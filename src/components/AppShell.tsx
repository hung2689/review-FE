import { BookMarked, ClipboardCheck, Database, Home, Moon, RotateCcw, Settings2, Sun } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const links = [
  { to: '/', label: 'Home', mobileLabel: 'Home', icon: Home },
  { to: '/study', label: 'Học bài', mobileLabel: 'Học', icon: BookMarked },
  { to: '/practice/setup', label: 'Luyện tập', mobileLabel: 'Luyện', icon: Settings2 },
  { to: '/wrong', label: 'Câu sai', mobileLabel: 'Câu sai', icon: RotateCcw },
  { to: '/data-review', label: 'Data review', mobileLabel: 'Data', icon: Database }
];

export function AppShell() {
  const { dark, setDark } = useTheme();

  return (
    <div className="dark-page-glow relative isolate min-h-screen overflow-x-hidden bg-canvas text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_8%_0%,oklch(var(--color-teal-primary)/0.14),transparent_26rem),radial-gradient(circle_at_58%_34%,oklch(var(--color-mint)/0.18),transparent_31rem),radial-gradient(circle_at_94%_88%,oklch(var(--color-gold)/0.13),transparent_24rem),linear-gradient(180deg,oklch(var(--canvas)),oklch(var(--surface)))] dark:bg-[radial-gradient(circle_at_8%_0%,oklch(var(--teal-primary)/0.14),transparent_25rem),radial-gradient(circle_at_58%_34%,oklch(var(--bg-surface-soft)/0.34),transparent_32rem),radial-gradient(circle_at_94%_88%,oklch(var(--gold-primary)/0.1),transparent_24rem),linear-gradient(180deg,oklch(var(--bg-page)),oklch(0.13_0.026_190))]" />
      <div className="pointer-events-none fixed right-8 top-32 -z-10 hidden grid-cols-8 gap-3 opacity-25 dark:opacity-15 lg:grid">
        {Array.from({ length: 40 }).map((_, index) => (
          <span key={index} className="size-1 rounded-full bg-tealPrimary" />
        ))}
      </div>

      <header className="sticky top-2 z-40 px-3 sm:top-3 sm:px-4">
        <div className="fx-glass fx-glow-border mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-[24px] border border-mint/55 bg-panel/80 px-3 py-2.5 shadow-card backdrop-blur-xl dark:border-borderSubtle/55 dark:bg-bgSurface/80 md:gap-3 md:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="fx-icon-aura flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-tealPrimary to-emerald text-accentInk shadow-glow">
              <ClipboardCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold leading-tight text-textPrimary">SWR302 Practice Hub</p>
              <p className="hidden text-xs text-muted sm:block">Local OCR, review, and quiz practice</p>
            </div>
          </div>
          <nav className="hidden min-w-0 flex-1 justify-center gap-1 overflow-hidden md:flex lg:gap-2">
            {links.map((link) => (
              <NavigationItem key={link.to} link={link} />
            ))}
          </nav>
          <button
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-mint/55 bg-panel/70 text-ink shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:rotate-6 hover:bg-mint/35 dark:border-borderStrong/40 dark:bg-bgSurfaceElevated/75 dark:text-textPrimary dark:hover:bg-bgSurfaceSoft/80"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pb-24 pt-5 sm:px-4 sm:pt-7 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-mint/50 bg-panel/90 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-card backdrop-blur-xl dark:border-borderSubtle/65 dark:bg-bgSurface/92 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-t-[22px]">
          {links.map((link) => (
            <NavigationItem key={link.to} compact link={link} />
          ))}
        </div>
      </nav>
    </div>
  );
}

type NavigationLink = (typeof links)[number];

function NavigationItem({ compact = false, link }: { compact?: boolean; link: NavigationLink }) {
  const Icon = link.icon;

  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        compact
          ? `flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-br from-tealPrimary to-emerald text-accentInk shadow-glow dark:from-tealPrimary dark:to-tealHover dark:text-bgPage'
                : 'text-muted hover:-translate-y-0.5 hover:bg-mint/30 hover:text-ink dark:text-textSecondary dark:hover:bg-tealSoft/15 dark:hover:text-textPrimary'
            }`
          : `inline-flex min-h-10 min-w-0 shrink items-center gap-2 rounded-2xl px-2.5 text-sm font-semibold transition-all duration-200 lg:px-4 ${
              isActive
                ? 'bg-gradient-to-r from-tealPrimary to-emerald text-accentInk shadow-glow dark:from-tealPrimary dark:to-tealHover dark:text-bgPage'
                : 'text-muted hover:-translate-y-0.5 hover:bg-mint/35 hover:text-ink dark:text-textSecondary dark:hover:bg-tealSoft/15 dark:hover:text-textPrimary'
            }`
      }
    >
      <Icon className="shrink-0" size={compact ? 18 : 16} />
      <span className={compact ? undefined : 'truncate'}>{compact ? link.mobileLabel : link.label}</span>
    </NavLink>
  );
}
