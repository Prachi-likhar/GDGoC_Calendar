import { CheckCircle2, Download } from 'lucide-react';
import ConfettiBurst from '../../components/common/ConfettiBurst.jsx';
import { formatIST } from '../../utils/dates.js';

export default function RegisterSuccess({ result }) {
  const { registration, qrDataUrl, event } = result;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gdg-green/40 bg-[var(--bg-surface)] p-6 text-center shadow-sm animate-fade-up">
      <ConfettiBurst active />
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gdg-green/15 text-gdg-green">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h2 className="mt-3 text-xl font-bold text-[var(--text-primary)]">You&apos;re registered!</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Digital ticket for <span className="font-semibold">{event.title}</span> ·{' '}
        {formatIST(event.startAt)}
      </p>

      <div className="mt-6 flex flex-col items-center">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-white p-3">
          <img src={qrDataUrl} alt="Event check-in QR code" className="h-52 w-52" />
        </div>
        <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
          Pass ID: {registration.qrToken}
        </p>
        <a
          href={qrDataUrl}
          download={`${event.slug}-qr.png`}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gdg-blue px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          <Download className="h-4 w-4" />
          Download QR pass
        </a>
      </div>
    </div>
  );
}
