import { Link } from 'react-router-dom';
import { LogOut, Menu, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTheme } from '../../hooks/useTheme.js';
import BracketMark from '../common/BracketMark.jsx';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 sm:px-6">
      <div className="flex items-center gap-2.5 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BracketMark className="h-8 w-8" />
        <span className="font-display text-sm font-bold text-[var(--text-primary)]">GDG</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] active:scale-95"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4 text-gdg-yellow" /> : <Moon className="h-4 w-4" />}
        </button>

        {user && (
          <>
            <Link
              to="/profile"
              className="hidden items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-[var(--bg-subtle)] sm:flex"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gdg-blue/15 text-xs font-bold text-gdg-blue">
                {user.name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium leading-tight text-[var(--text-primary)]">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-[var(--text-muted)]">
                  {user.role.replace('_', ' ')} · {user.domain}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
