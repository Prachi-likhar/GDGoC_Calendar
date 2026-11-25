import { Calendar, Copy, ExternalLink, MapPin, Pencil, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIST } from '../../utils/dates.js';
import StatusBadge from '../events/StatusBadge.jsx';

export default function EventModal({ event, canManage, onDuplicate, onClose }) {
  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xl animate-fade-up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <StatusBadge status={event.status} />
            <h2
              id="event-modal-title"
              className="mt-2 font-heading text-lg font-bold text-[var(--text-primary)]"
            >
              {event.title}
            </h2>
            <p className="text-xs capitalize text-[var(--text-secondary)]">
              {event.type.replace('_', ' ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5 text-sm text-[var(--text-secondary)]">
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <div>
              <p>{formatIST(event.startAt)}</p>
              <p className="text-xs text-[var(--text-muted)]">to {formatIST(event.endAt)}</p>
            </div>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <span>{event.venue}</span>
            </div>
          )}
          {event.description && (
            <p className="line-clamp-3 pt-1 text-xs text-[var(--text-muted)]">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onDuplicate(event._id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)]"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <Link
                to={`/events/${event._id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)]"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
            </>
          )}
          <Link
            to={`/events/${event._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gdg-blue px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            <span>Open detail</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

