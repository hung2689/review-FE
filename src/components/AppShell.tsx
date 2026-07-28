import { BookMarked, ClipboardCheck, Database, Home, Moon, RotateCcw, Settings2, Sun } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/study', label: 'Học bài', icon: BookMarked },
  { to: '/practice/setup', label: 'Luyện tập', icon: Settings2 },
  { to: '/wrong', label: 'Câu sai', icon: RotateCcw },
  { to: '/data-review', label: 'Data review', icon: Database }
];

export function AppShell() {
  const { dark, setDark } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accentInk">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">SWR302 Practice Hub</p>
              <p className="text-xs text-muted">Local OCR, review, and quiz practice</p>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto thin-scrollbar">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
                      isActive ? 'bg-panel2 text-ink' : 'text-muted hover:bg-panel2 hover:text-ink'
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.label}
                </NavLink>
              );
            })}
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
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
