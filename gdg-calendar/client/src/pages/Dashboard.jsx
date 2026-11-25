import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckSquare,
  Clock,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getAnalyticsOverviewRequest } from '../api/analytics.js';
import { listEventsRequest } from '../api/events.js';
import { listMyTasksRequest } from '../api/tasks.js';
import EmptyState from '../components/common/EmptyState.jsx';
import { Skeleton } from '../components/common/Loader.jsx';
import StatusBadge from '../components/events/StatusBadge.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { formatIST, formatISTDateOnly } from '../utils/dates.js';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCountdown(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return 'Starting now';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  return `${hours}h ${mins}m`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const canSeeAnalytics = user?.role === 'admin' || user?.role === 'domain_head';

  useEffect(() => {
    Promise.all([
      listEventsRequest().catch(() => []),
      listMyTasksRequest().catch(() => []),
      canSeeAnalytics ? getAnalyticsOverviewRequest().catch(() => null) : Promise.resolve(null),
    ])
      .then(([evData, taskData, ovData]) => {
        setEvents(evData);
        setTasks(taskData);
        setOverview(ovData);
      })
      .finally(() => setLoading(false));
  }, [canSeeAnalytics]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((e) => new Date(e.endAt) >= now && e.status !== 'cancelled');
  }, [events]);

  const nextEvent = upcomingEvents[0] || null;
  const openTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks]);
  const taskProgressPct =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const weeklyBars = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const count = tasks.filter((t) => {
        const ref = t.updatedAt || t.dueDate;
        return ref && new Date(ref).toISOString().slice(0, 10) === key;
      }).length;
      days.push({ key, label, count });
    }
    const max = Math.max(1, ...days.map((d) => d.count));
    return days.map((d) => ({ ...d, heightPct: Math.round((d.count / max) * 100) }));
  }, [tasks]);

  const recentActivity = useMemo(() => {
    const items = [
      ...events.slice(0, 4).map((ev) => ({
        id: `ev-${ev._id}`,
        text: `${ev.owner?.name || 'Organiser'} scheduled "${ev.title}"`,
        date: ev.updatedAt || ev.createdAt,
        to: `/events/${ev._id}`,
        dot: 'bg-gdg-blue',
      })),
      ...tasks.slice(0, 4).map((t) => ({
        id: `task-${t._id}`,
        text:
          t.status === 'done'
            ? `Completed task "${t.title}"`
            : `Task "${t.title}" (${t.status.replace('_', ' ')})`,
        date: t.updatedAt || t.createdAt,
        to: '/tasks',
        dot: t.status === 'done' ? 'bg-gdg-green' : 'bg-gdg-yellow',
      })),
    ];
    return items
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [events, tasks]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            <span className="capitalize">{user?.role?.replace('_', ' ')}</span> ·{' '}
            <span className="capitalize">{user?.domain}</span> domain
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'domain_head') && (
          <Link
            to="/events/new"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
          >
            Create event
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {nextEvent ? (
        <div className="relative overflow-hidden rounded-2xl border border-gdg-blue/25 bg-gradient-to-br from-gdg-blue/10 via-[var(--bg-surface)] to-gdg-green/10 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gdg-blue px-3 py-0.5 text-xs font-semibold text-white">
                  Next upcoming event
                </span>
                <StatusBadge status={nextEvent.status} />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                {nextEvent.title}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gdg-blue" />
                  {formatIST(nextEvent.startAt)}
                </span>
                {nextEvent.venue && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-gdg-red" />
                    {nextEvent.venue}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2.5 text-left sm:text-right">
                <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                  <Clock className="h-3.5 w-3.5 text-gdg-yellow" />
                  Starts in
                </p>
                <p className="font-mono text-lg font-bold text-[var(--text-primary)]">
                  {formatCountdown(nextEvent.startAt)}
                </p>
              </div>
              <Link
                to={`/events/${nextEvent._id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gdg-blue hover:underline"
              >
                Open event workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No upcoming events yet"
          description="Schedule your next workshop, talk, or study jam from the calendar."
        />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Upcoming events</p>
          <p className="mt-2 font-display text-2xl font-bold text-gdg-blue">
            {upcomingEvents.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Tasks due</p>
          <p className="mt-2 font-display text-2xl font-bold text-gdg-red">{openTasks.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Total registrations</p>
          <p className="mt-2 font-display text-2xl font-bold text-[var(--text-primary)]">
            {overview ? overview.totals.registrations : '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Attendance rate</p>
          <p className="mt-2 font-display text-2xl font-bold text-gdg-green">
            {overview ? `${overview.totals.attendanceRate}%` : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <CheckSquare className="h-4 w-4 text-gdg-green" />
              My tasks
            </h2>
            <Link to="/tasks" className="text-xs font-medium text-gdg-blue hover:underline">
              View all
            </Link>
          </div>

          <div className="mb-4 rounded-xl bg-[var(--bg-subtle)] p-3.5">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--text-secondary)]">
                Personal completion ({completedTasks.length} of {tasks.length})
              </span>
              <span className="font-mono font-semibold text-gdg-green">{taskProgressPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
              <div
                className="h-full rounded-full bg-gdg-green transition-all duration-500"
                style={{ width: `${taskProgressPct}%` }}
              />
            </div>
          </div>

          {openTasks.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              All assigned tasks are completed.
            </p>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {openTasks.slice(0, 5).map((task) => {
                const overdue = new Date(task.dueDate) < new Date();
                return (
                  <div key={task._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Due {formatISTDateOnly(task.dueDate)} ·{' '}
                        <span className="capitalize">{task.domain}</span>
                        {overdue && (
                          <span className="ml-2 rounded bg-gdg-red/15 px-1.5 py-0.5 font-semibold text-gdg-red">
                            Overdue
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs capitalize text-[var(--text-secondary)]">
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <TrendingUp className="h-4 w-4 text-gdg-blue" />
              Weekly task activity
            </h2>
          </div>
          <div className="flex h-40 items-end justify-between gap-2 pt-4">
            {weeklyBars.map((bar) => (
              <div key={bar.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end justify-center rounded-lg bg-[var(--bg-subtle)] p-1">
                  <div
                    className="w-full rounded-md bg-gdg-blue transition-all duration-300"
                    style={{ height: `${Math.max(bar.count > 0 ? 16 : 4, bar.heightPct)}%` }}
                    title={`${bar.count} tasks`}
                  />
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <Calendar className="h-4 w-4 text-gdg-blue" />
              Upcoming events preview
            </h2>
            <Link to="/calendar" className="text-xs font-medium text-gdg-blue hover:underline">
              Explore all
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No upcoming events scheduled.</p>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {upcomingEvents.slice(0, 4).map((ev) => (
                <Link
                  key={ev._id}
                  to={`/events/${ev._id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {ev.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{formatIST(ev.startAt)}</p>
                  </div>
                  <StatusBadge status={ev.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
              <Activity className="h-4 w-4 text-gdg-yellow" />
              Recent team activity
            </h2>
            {user?.role === 'admin' && (
              <Link to="/team" className="inline-flex items-center gap-1 text-xs font-medium text-gdg-blue hover:underline">
                <Users className="h-3.5 w-3.5" />
                Team
              </Link>
            )}
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No recent team activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[var(--text-primary)]">{item.text}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatIST(item.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
