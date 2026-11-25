export function Skeleton({ className = 'h-4 w-full' }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--bg-subtle)] ${className}`}
      aria-hidden="true"
    />
  );
}

export default function Loader({ label = 'Loading...' }) {
  return (
    <div
      className="flex min-h-[220px] flex-col items-center justify-center gap-3.5 text-[var(--text-muted)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full bg-gdg-blue animate-gdg-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-3 w-3 rounded-full bg-gdg-red animate-gdg-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-3 w-3 rounded-full bg-gdg-yellow animate-gdg-bounce"
          style={{ animationDelay: '300ms' }}
        />
        <span
          className="h-3 w-3 rounded-full bg-gdg-green animate-gdg-bounce"
          style={{ animationDelay: '450ms' }}
        />
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
