export default function AttendanceCounter({ registered = 0, checkedIn = 0 }) {
  const pct = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Live attendance
          </p>
          <p className="mt-1 font-heading text-3xl font-bold tabular-nums text-[var(--text-primary)]">
            {checkedIn}{' '}
            <span className="text-lg font-normal text-[var(--text-muted)]">/ {registered}</span>
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold tabular-nums text-gdg-green dark:bg-emerald-950/50">
          {pct}%
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
        <div
          className="h-full rounded-full bg-gdg-green transition-all duration-300"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

