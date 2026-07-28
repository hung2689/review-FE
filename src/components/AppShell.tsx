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
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 md:px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accentInk">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">SWR302 Practice Hub</p>
              <p className="hidden text-xs text-muted sm:block">Local OCR, review, and quiz practice</p>
            </div>
          </div>
          <nav className="hidden gap-1 overflow-x-auto thin-scrollbar md:flex">
            {links.map((link) => (
              <NavigationItem key={link.to} link={link} />
            ))}
          </nav>
          <button
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex size-10 items-center justify-center rounded-md border border-line bg-panel text-ink hover:bg-panel2"
            onClick={() => setDark(!dark)}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 pb-24 pt-4 sm:px-4 sm:pt-6 md:pb-6">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-soft backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
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
          ? `flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'bg-panel2 text-ink' : 'text-muted hover:bg-panel2 hover:text-ink'
            }`
          : `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              isActive ? 'bg-panel2 text-ink' : 'text-muted hover:bg-panel2 hover:text-ink'
            }`
      }
    >
      <Icon size={compact ? 18 : 16} />
      <span>{compact ? link.mobileLabel : link.label}</span>
    </NavLink>
  );
}
