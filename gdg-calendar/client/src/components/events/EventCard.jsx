import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatIST } from '../../utils/dates.js';
import { getEventCoverGradient } from '../../utils/statusColors.js';
import StatusBadge from './StatusBadge.jsx';

export default function EventCard({ event, to, registeredCount = null }) {
  const gradient = getEventCoverGradient(event.type);
  const capacity = event.capacity || null;
  const count = registeredCount ?? event.registeredCount ?? null;
  const pct = capacity && count !== null ? Math.min(100, Math.round((count / capacity) * 100)) : null;

  return (
    <Link
      to={to}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
    >
      <div className={`relative h-32 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
        {event.posterUrl && (
          <img
            src={event.posterUrl}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-900 backdrop-blur-xs">
            {event.type.replace('_', ' ')}
          </span>
          {event.owner?.domain && (
            <span className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium capitalize text-white">
              {event.owner.domain}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-2 font-display text-base font-bold text-[var(--text-primary)] group-hover:text-gdg-blue">
            {event.title}
          </h3>
          {event.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
              {event.description}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-gdg-blue" />
            <span className="truncate">{formatIST(event.startAt)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gdg-red" />
              <span className="truncate">{event.venue}</span>
            </div>
          )}

          {(count !== null || capacity) && (
            <div className="pt-1">
              <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {count !== null ? `${count} registered` : 'Capacity'}
                </span>
                {capacity && <span>{capacity} seats</span>}
              </div>
              {pct !== null && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded-full bg-gdg-green transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

