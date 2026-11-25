import { useCallback, useEffect, useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import {
  createTemplateRequest,
  deleteTemplateRequest,
  listTemplatesRequest,
} from '../api/templates.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useToast } from '../hooks/useToast.js';
import { EVENT_TYPES } from '../utils/statusColors.js';

const DOMAINS = ['tech', 'design', 'pr', 'content', 'logistics', 'outreach'];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('workshop');
  const [tasks, setTasks] = useState([
    { title: 'Book venue & AV', offsetDays: 14, domain: 'logistics', priority: 'high' },
  ]);
  const [saving, setSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    try {
      setError('');
      const data = await listTemplatesRequest();
      setTemplates(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleAddTaskRow = () => {
    setTasks((prev) => [
      ...prev,
      { title: '', offsetDays: 7, domain: 'tech', priority: 'medium' },
    ]);
  };

  const handleTaskChange = (idx, field, value) => {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      setError('');
      await createTemplateRequest({
        name: name.trim(),
        eventType,
        tasks: tasks.filter((t) => t.title.trim()),
      });
      setName('');
      toast('Template created', 'success');
      await loadTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create template';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTemplateRequest(id);
      toast('Template deleted', 'info');
      await loadTemplates();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete template';
      setError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
          Event templates
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Define reusable T-30 to T+7 task checklists that auto-generate when creating an event.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tpl-name" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Template name
            </label>
            <input
              id="tpl-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study Jam"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="tpl-type" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Event type
            </label>
            <select
              id="tpl-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Checklist tasks
            </span>
            <button
              type="button"
              onClick={handleAddTaskRow}
              className="inline-flex items-center gap-1 text-xs font-medium text-gdg-blue hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add task
            </button>
          </div>

          {tasks.map((t, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-6">
              <input
                type="text"
                value={t.title}
                onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                placeholder="Task title"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none sm:col-span-3"
              />
              <input
                type="number"
                value={t.offsetDays}
                onChange={(e) => handleTaskChange(idx, 'offsetDays', Number(e.target.value))}
                placeholder="Days before"
                title="Days before event (negative = after)"
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
              />
              <select
                value={t.domain}
                onChange={(e) => handleTaskChange(idx, 'domain', e.target.value)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-1.5 text-sm capitalize text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={t.priority}
                onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-1.5 text-sm capitalize text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Create template'}
          </button>
        </div>
      </form>

      {loading ? (
        <Loader label="Loading templates..." />
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Create your first checklist template above to speed up future event planning."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-gdg-blue dark:bg-blue-950/50">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                      {tpl.name}
                    </h2>
                    <p className="text-xs capitalize text-[var(--text-secondary)]">
                      {tpl.eventType.replace('_', ' ')} · {tpl.tasks?.length || 0} tasks
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl._id)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-red-50 hover:text-gdg-red dark:hover:bg-red-950/50"
                  aria-label={`Delete ${tpl.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {tpl.tasks?.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
                  {tpl.tasks.map((task, idx) => (
                    <li key={idx} className="flex justify-between gap-2">
                      <span>{task.title}</span>
                      <span className="font-mono text-[var(--text-muted)]">
                        {task.offsetDays >= 0
                          ? `T-${task.offsetDays}`
                          : `T+${Math.abs(task.offsetDays)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

