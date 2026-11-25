import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CalendarOff,
  CheckSquare,
  FileText,
  Globe,
  LayoutDashboard,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import BracketMark from '../common/BracketMark.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'domain_head', 'member'] },
  { to: '/calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'domain_head', 'member'] },
  { to: '/tasks', label: 'My tasks', icon: CheckSquare, roles: ['admin', 'domain_head', 'member'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'domain_head'] },
  { to: '/templates', label: 'Templates', icon: FileText, roles: ['admin'] },
  { to: '/blocked-dates', label: 'Blocked dates', icon: CalendarOff, roles: ['admin'] },
  { to: '/team', label: 'Team', icon: Users, roles: ['admin'] },
  { to: '/e', label: 'Public page', icon: Globe, roles: ['admin', 'domain_head', 'member'] },
  { to: '/profile', label: 'Profile', icon: User, roles: ['admin', 'domain_head', 'member'] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-5">
          <div className="flex items-center gap-2.5">
            <BracketMark className="h-9 w-9" />
            <div>
              <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                GDG on Campus
              </p>
              <p className="text-xs text-[var(--text-muted)]">Chapter ops</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
          {visibleItems.map((item) => {
            const NavIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? 'bg-gdg-blue/10 text-gdg-blue'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <NavIcon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border-subtle)] p-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gdg-blue" />
            <span className="h-2 w-2 rounded-full bg-gdg-red" />
            <span className="h-2 w-2 rounded-full bg-gdg-yellow" />
            <span className="h-2 w-2 rounded-full bg-gdg-green" />
            <span className="ml-1 font-medium text-[var(--text-secondary)]">Chapter workspace</span>
          </div>
        </div>
      </aside>
    </>
  );
}
