import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Radio } from 'lucide-react';
import { getEventRequest } from '../api/events.js';
import { getAttendanceRequest } from '../api/registrations.js';
import { listEventSessionsRequest } from '../api/sessions.js';
import Loader from '../components/common/Loader.jsx';
import LiveRunSheet from '../components/runsheet/LiveRunSheet.jsx';
import { useSocket } from '../hooks/useSocket.js';

export default function LiveView() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState({ registered: 0, checkedIn: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEventRequest(id),
      listEventSessionsRequest(id),
      getAttendanceRequest(id).catch(() => ({ registered: 0, checkedIn: 0 })),
    ])
      .then(([ev, sess, att]) => {
        setEvent(ev);
        setSessions(sess);
        setAttendance(att);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useSocket(id, {
    'session:updated': (updated) => {
      setSessions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
    },
    'session:reordered': (reordered) => {
      if (Array.isArray(reordered)) {
        setSessions(reordered);
      }
    },
    'checkin:new': (payload) => {
      if (payload?.attendance) {
        setAttendance(payload.attendance);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader label="Loading live view..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={`/events/${id}`}
              className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gdg-green">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live Event View
              </div>
              <h1 className="mt-1 text-3xl font-bold">{event?.title}</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Checked in</p>
            <p className="text-2xl font-bold text-gdg-green">
              {attendance.checkedIn} / {attendance.registered}
            </p>
          </div>
        </div>

        <LiveRunSheet sessions={sessions} />
      </div>
    </div>
  );
}

