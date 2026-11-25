import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import {
  createSessionRequest,
  deleteSessionRequest,
  listEventSessionsRequest,
  reorderSessionsRequest,
  updateSessionRequest,
} from '../../api/sessions.js';
import { formatIST, fromISTInputValue } from '../../utils/dates.js';
import Loader from '../common/Loader.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function RunSheetEditor({ event, canEdit }) {
  const [sessions, setSessions] = useState([]);
  const [activeDay, setActiveDay] = useState(1);
  const [extraDays, setExtraDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setError('');
      const data = await listEventSessionsRequest(event._id);
      setSessions(data);
      const maxSessionDay = data.reduce((max, s) => Math.max(max, s.day || 1), 1);
      setExtraDays((prev) => Math.max(prev, maxSessionDay));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load run sheet');
    } finally {
      setLoading(false);
    }
  }, [event._id]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const spanDays = Math.max(
    1,
    Math.ceil((new Date(event.endAt) - new Date(event.startAt)) / 86400000)
  );
  const totalDays = Math.max(spanDays, extraDays);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  const daySessions = sessions
    .filter((s) => (s.day || 1) === activeDay)
    .sort((a, b) => a.order - b.order);

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;
    setAdding(true);
    try {
      const created = await createSessionRequest(event._id, {
        day: activeDay,
        title: title.trim(),
        speaker: speaker.trim(),
        startAt: fromISTInputValue(startTime),
        endAt: fromISTInputValue(endTime),
        notes: notes.trim(),
      });
      setSessions((prev) => [...prev, created]);
      setTitle('');
      setSpeaker('');
      setNotes('');
      toast('Session added to run sheet', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add session';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= daySessions.length) return;

    const reordered = [...daySessions];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);

    const items = reordered.map((s, idx) => ({
      id: s._id,
      day: activeDay,
      order: idx,
    }));

    try {
      const updatedAll = await reorderSessionsRequest(event._id, items);
      setSessions(updatedAll);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reorder sessions');
    }
  };

  const handleStatusChange = async (sessionId, status) => {
    try {
      const updated = await updateSessionRequest(sessionId, { status });
      setSessions((prev) => prev.map((s) => (s._id === sessionId ? updated : s)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update session');
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await deleteSessionRequest(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete session');
    }
  };

  if (loading) return <Loader label="Loading run sheet..." />;

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeDay === day
                  ? 'bg-gdg-blue text-white'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              const next = totalDays + 1;
              setExtraDays(next);
              setActiveDay(next);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add day
          </button>
        )}
      </div>

      {canEdit && (
        <form
          onSubmit={handleAddSession}
          className="grid gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:grid-cols-6"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Day ${activeDay} session title...`}
            required
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none sm:col-span-2"
          />
          <input
            type="text"
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            placeholder="Speaker (optional)"
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          />
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gdg-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>
      )}

      {daySessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
          No sessions scheduled for Day {activeDay} yet.
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {daySessions.map((session, idx) => (
            <div key={session._id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{session.title}</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {formatIST(session.startAt, 'hh:mm a')} — {formatIST(session.endAt, 'hh:mm a')}
                  {session.speaker ? ` · ${session.speaker}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {canEdit ? (
                  <>
                    <select
                      value={session.status}
                      onChange={(e) => handleStatusChange(session._id, e.target.value)}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2.5 py-1 text-xs capitalize text-[var(--text-primary)]"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      className="rounded p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === daySessions.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      className="rounded p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(session._id)}
                      className="rounded p-1.5 text-[var(--text-muted)] transition hover:bg-red-50 hover:text-gdg-red dark:hover:bg-red-950/50"
                      aria-label={`Delete ${session.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--text-secondary)]">
                    {session.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

