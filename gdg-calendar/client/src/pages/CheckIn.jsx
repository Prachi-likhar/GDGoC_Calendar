import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getEventRequest } from '../api/events.js';
import { checkInRequest, getAttendanceRequest } from '../api/registrations.js';
import AttendanceCounter from '../components/checkin/AttendanceCounter.jsx';
import QRScanner from '../components/checkin/QRScanner.jsx';
import Loader from '../components/common/Loader.jsx';
import { useSocket } from '../hooks/useSocket.js';

export default function CheckIn() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState({ registered: 0, checkedIn: 0 });
  const [manualToken, setManualToken] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastScannedRef = useRef('');

  useEffect(() => {
    Promise.all([getEventRequest(id), getAttendanceRequest(id)])
      .then(([ev, att]) => {
        setEvent(ev);
        setAttendance(att);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useSocket(id, {
    'checkin:new': (payload) => {
      if (payload?.attendance) {
        setAttendance(payload.attendance);
      }
    },
  });

  const processCheckIn = useCallback(
    async (qrToken) => {
      const token = qrToken.trim();
      if (!token) return;
      try {
        const res = await checkInRequest(id, token);
        setAttendance(res.attendance);
        setFeedback({
          type: 'success',
          message: `Checked in: ${res.registration.name} (${res.registration.email})`,
        });
        setManualToken('');
      } catch (err) {
        const status = err.response?.status;
        setFeedback({
          type: status === 409 ? 'duplicate' : 'error',
          message: err.response?.data?.message || 'Check-in failed',
        });
      }
    },
    [id]
  );

  const handleScan = useCallback(
    (decoded) => {
      if (decoded === lastScannedRef.current) return;
      lastScannedRef.current = decoded;
      processCheckIn(decoded);
      setTimeout(() => {
        lastScannedRef.current = '';
      }, 2500);
    },
    [processCheckIn]
  );

  if (loading) return <Loader label="Loading check-in..." />;

  const bannerClass =
    feedback?.type === 'success'
      ? 'border-gdg-green/40 bg-gdg-green/10 text-gdg-green'
      : feedback?.type === 'duplicate'
        ? 'border-gdg-yellow/40 bg-gdg-yellow/10 text-amber-600 dark:text-gdg-yellow'
        : 'border-gdg-red/40 bg-gdg-red/10 text-gdg-red';

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link
          to={`/events/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">QR check-in</h1>
          <p className="text-sm text-[var(--text-muted)]">{event?.title}</p>
        </div>
      </div>

      <AttendanceCounter registered={attendance.registered} checkedIn={attendance.checkedIn} />

      {feedback && (
        <div role="status" className={`rounded-xl border px-4 py-3 text-sm font-medium ${bannerClass}`}>
          {feedback.message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Camera scanner</h2>
          <QRScanner onScan={handleScan} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            processCheckIn(manualToken);
          }}
          className="space-y-3 self-start rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
        >
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
            Manual token check-in
          </h2>
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste QR token..."
            className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 font-mono text-sm text-[var(--text-primary)]"
          />
          <button
            type="submit"
            className="min-h-[44px] w-full rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 active:scale-[0.98]"
          >
            Check in attendee
          </button>
        </form>
      </div>
    </div>
  );
}

