import { formatIST } from '../../utils/dates.js';

export default function LiveRunSheet({ sessions = [] }) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
        No sessions scheduled yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isLive = session.status === 'live';
        const isDone = session.status === 'done';
        return (
          <div
            key={session._id}
            className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 transition-all ${
              isLive
                ? 'border-gdg-green bg-emerald-950/60 shadow-lg ring-2 ring-gdg-green/40'
                : isDone
                  ? 'border-slate-800 bg-slate-900/50 opacity-60'
                  : 'border-slate-800 bg-slate-900'
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                  Day {session.day || 1}
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gdg-green/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-gdg-green" />
                    LIVE NOW
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 text-xl font-bold text-white">{session.title}</h3>
              {session.speaker && <p className="text-sm text-slate-300">{session.speaker}</p>}
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold text-white">
                {formatIST(session.startAt, 'hh:mm a')} — {formatIST(session.endAt, 'hh:mm a')}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-400">{session.status}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

