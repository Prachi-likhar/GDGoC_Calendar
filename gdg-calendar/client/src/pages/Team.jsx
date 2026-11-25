import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award, UserPlus } from 'lucide-react';
import { listEventsRequest } from '../api/events.js';
import { createUserRequest, listUsersRequest, updateUserRequest } from '../api/users.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Loader from '../components/common/Loader.jsx';
import { useToast } from '../hooks/useToast.js';

const DOMAINS = ['tech', 'design', 'pr', 'content', 'logistics', 'outreach'];
const ROLES = ['admin', 'domain_head', 'member'];

const createMemberSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(ROLES),
  domain: z.enum(DOMAINS),
});

export default function Team() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createMemberSchema),
    defaultValues: { name: '', email: '', password: '', role: 'member', domain: 'tech' },
  });

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [usersData, eventsData] = await Promise.all([
        listUsersRequest(),
        listEventsRequest().catch(() => []),
      ]);
      setUsers(usersData);
      setEvents(eventsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onCreate = async (values) => {
    setError('');
    try {
      const created = await createUserRequest(values);
      setUsers((prev) => [...prev, created]);
      reset();
      showToast(`Added ${created.name} to the team`, 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleUpdate = async (id, patch) => {
    try {
      const updated = await updateUserRequest(id, patch);
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
      showToast('Member updated', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member');
    }
  };

  const recognitions = useMemo(() => {
    if (events.length === 0) return [];
    const ownerCounts = {};
    for (const ev of events) {
      if (ev.status === 'cancelled' || !ev.owner?._id) continue;
      const id = ev.owner._id;
      if (!ownerCounts[id]) {
        ownerCounts[id] = { user: ev.owner, count: 0 };
      }
      ownerCounts[id].count += 1;
    }
    return Object.values(ownerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((entry) => ({
        user: entry.user,
        badge:
          entry.user.domain === 'tech'
            ? 'Tech Contributor'
            : entry.user.domain === 'design'
              ? 'Design Contributor'
              : entry.user.domain === 'outreach' || entry.user.domain === 'pr'
                ? 'Community Builder'
                : 'Event Champion',
        detail: `Organised ${entry.count} chapter event${entry.count > 1 ? 's' : ''}`,
      }));
  }, [events]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Team management</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Add GDG members and manage roles, domains, and access.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onCreate)}
        className="grid gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:grid-cols-6"
        noValidate
      >
        <div className="sm:col-span-2">
          <input
            type="text"
            placeholder="Full name"
            {...register('name')}
            className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-gdg-red">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-gdg-red">{errors.email.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <input
            type="password"
            placeholder="Initial password (8+ chars)"
            {...register('password')}
            className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-gdg-red">{errors.password.message}</p>
          )}
        </div>

        <select
          {...register('role')}
          className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm sm:col-span-2"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          {...register('domain')}
          className="min-h-[40px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm capitalize sm:col-span-2"
        >
          {DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60 sm:col-span-2"
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Adding...' : 'Add member'}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Award className="h-4 w-4 text-gdg-yellow" />
          Volunteer recognition
        </h2>
        {recognitions.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No chapter contributions yet"
            description="Recognition cards appear automatically as members organise events."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recognitions.map((rec) => (
              <div
                key={rec.user._id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <span className="rounded-full bg-gdg-yellow/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-gdg-yellow">
                  {rec.badge}
                </span>
                <p className="mt-2 font-display text-sm font-bold text-[var(--text-primary)]">
                  {rec.user.name}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{rec.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <Loader label="Loading team..." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{u.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdate(u._id, { role: e.target.value })}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-1 text-xs"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.domain}
                      onChange={(e) => handleUpdate(u._id, { domain: e.target.value })}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-1 text-xs capitalize"
                    >
                      {DOMAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleUpdate(u._id, { isActive: !u.isActive })}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? 'bg-gdg-green/15 text-gdg-green'
                          : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
