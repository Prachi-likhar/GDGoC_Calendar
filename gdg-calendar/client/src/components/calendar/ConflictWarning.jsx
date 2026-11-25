import { AlertTriangle, CalendarOff, Calendar } from 'lucide-react';
import { formatIST, formatISTDateOnly } from '../../utils/dates.js';

export default function ConflictWarning({ clashes, onForceSave, onCancel, saving }) {
  if (!clashes) return null;

  const { events = [], blockedDates = [] } = clashes;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl animate-fade-up">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="conflict-dialog-title"
              className="font-heading text-lg font-semibold text-[var(--text-primary)]"
            >
              Schedule conflict detected
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              This event overlaps with the following existing events or blocked dates.
            </p>
          </div>
        </div>

        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
          {events.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Overlapping events
              </p>
              <ul className="space-y-2">
                {events.map((ev) => (
                  <li
                    key={ev._id}
                    className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30"
                  >
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{ev.title}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatIST(ev.startAt)} — {formatIST(ev.endAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {blockedDates.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Blocked dates
              </p>
              <ul className="space-y-2">
                {blockedDates.map((bd) => (
                  <li
                    key={bd._id}
                    className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/70 p-3 text-sm dark:border-red-900/60 dark:bg-red-950/30"
                  >
                    <CalendarOff className="mt-0.5 h-4 w-4 shrink-0 text-gdg-red" />
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {bd.title}{' '}
                        <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs capitalize text-red-700 dark:bg-red-950 dark:text-red-300">
                          {bd.reason.replace('_', ' ')}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatISTDateOnly(bd.startDate)} — {formatISTDateOnly(bd.endDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)]"
          >
            Change date
          </button>
          <button
            type="button"
            onClick={onForceSave}
            disabled={saving}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save anyway'}
          </button>
        </div>
      </div>
    </div>
  );
}

