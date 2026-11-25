import { NavLink } from 'react-router-dom';
import { BarChart3, Calendar, CheckSquare, Globe, Home, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const canSeeAnalytics = user?.role === 'admin' || user?.role === 'domain_head';

  const items = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/calendar', label: 'Events', icon: Calendar },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    canSeeAnalytics
      ? { to: '/analytics', label: 'Insights', icon: BarChart3 }
      : { to: '/e', label: 'Discover', icon: Globe },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 px-2 py-1.5 shadow-lg backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const NavIcon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] font-medium transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gdg-blue/10 text-gdg-blue'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <NavIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

