import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckSquare } from 'lucide-react';
import { listMyTasksRequest, updateTaskRequest } from '../api/tasks.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Loader from '../components/common/Loader.jsx';
import { useToast } from '../hooks/useToast.js';
import { formatISTDateOnly } from '../utils/dates.js';

export default function MyTasks() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      setError('');
      const data = await listMyTasksRequest();
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const updated = await updateTaskRequest(taskId, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: updated.status } : t)));
      showToast(`Task moved to ${status.replace('_', ' ')}`, 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const contribution = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate) < new Date()).length;
    const pct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return { total: tasks.length, completed, inProgress, overdue, pct };
  }, [tasks]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  if (loading) return <Loader label="Loading your tasks..." />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">My tasks</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Tasks assigned to you across all chapter events.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-gdg-blue" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">My contribution</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-[var(--bg-subtle)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Completed</p>
            <p className="mt-1 font-display text-xl font-bold text-gdg-green">
              {contribution.completed}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-subtle)] p-3">
            <p className="text-xs text-[var(--text-muted)]">In progress</p>
            <p className="mt-1 font-display text-xl font-bold text-gdg-blue">
              {contribution.inProgress}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-subtle)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Overdue</p>
            <p className="mt-1 font-display text-xl font-bold text-gdg-red">
              {contribution.overdue}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-subtle)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Completion rate</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--text-primary)]">
              {contribution.pct}%
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'todo', label: 'To do' },
          { key: 'in_progress', label: 'In progress' },
          { key: 'done', label: 'Done' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-medium ${
              filter === tab.key
                ? 'bg-gdg-blue text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks in this view"
          description="You are all caught up here."
        />
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {filtered.map((task) => {
            const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date();
            return (
              <div
                key={task._id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{task.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    {task.eventId ? (
                      <Link
                        to={`/events/${task.eventId._id}`}
                        className="font-medium text-gdg-blue hover:underline"
                      >
                        {task.eventId.title}
                      </Link>
                    ) : (
                      'Event'
                    )}{' '}
                    · Due {formatISTDateOnly(task.dueDate)} ·{' '}
                    <span className="capitalize">{task.domain}</span>
                    {isOverdue && (
                      <span className="ml-2 rounded bg-gdg-red/15 px-1.5 py-0.5 font-semibold text-gdg-red">
                        Overdue
                      </span>
                    )}
                  </p>
                </div>

                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="min-h-[38px] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)]"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
