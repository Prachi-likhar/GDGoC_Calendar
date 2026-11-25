import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Calendar,
  Copy,
  Download,
  ExternalLink,
  FileBarChart,
  MapPin,
  Mic,
  Pencil,
  QrCode,
  Radio,
  Trash2,
  Users,
} from 'lucide-react';
import { downloadBlob, getEventFeedbackRequest, getEventReportRequest } from '../api/analytics.js';
import { deleteEventRequest, duplicateEventRequest, getEventRequest } from '../api/events.js';
import { getAttendanceRequest, listRegistrationsRequest } from '../api/registrations.js';
import EmptyState from '../components/common/EmptyState.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/events/StatusBadge.jsx';
import RunSheetEditor from '../components/runsheet/RunSheetEditor.jsx';
import TaskBoard from '../components/tasks/TaskBoard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { formatIST } from '../utils/dates.js';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'runsheet', label: 'Run sheet' },
  { key: 'speakers', label: 'Speakers' },
  { key: 'team', label: 'Team' },
  { key: 'registrations', label: 'Registrations' },
  { key: 'feedback', label: 'Feedback' },
];

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [feedbackData, setFeedbackData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isOrganiser = user?.role === 'admin' || user?.role === 'domain_head';

  useEffect(() => {
    Promise.all([
      getEventRequest(id),
      isOrganiser ? getAttendanceRequest(id).catch(() => null) : Promise.resolve(null),
    ])
      .then(([data, att]) => {
        setEvent(data);
        setAttendance(att);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id, isOrganiser]);

  useEffect(() => {
    if (activeTab === 'registrations' && isOrganiser) {
      listRegistrationsRequest(id)
        .then((data) => setRegistrations(data))
        .catch(() => { });
    }
    if (activeTab === 'feedback' && isOrganiser) {
      Promise.all([getEventFeedbackRequest(id), getEventReportRequest(id)])
        .then(([fb, rep]) => {
          setFeedbackData(fb);
          setReportData(rep);
        })
        .catch(() => { });
    }
  }, [activeTab, id, isOrganiser]);

  const speakers = useMemo(() => {
    if (!event?.sessions) return [];
    const map = new Map();
    for (const s of event.sessions) {
      if (s.speaker && s.speaker.trim()) {
        const name = s.speaker.trim();
        if (!map.has(name)) {
          map.set(name, { name, sessions: [] });
        }
        map.get(name).sessions.push(s.title);
      }
    }
    return Array.from(map.values());
  }, [event?.sessions]);

  if (loading) return <Loader label="Loading event details..." />;

  if (error || !event) {
    return (
      <div className="space-y-4">
        <Link to="/calendar" className="inline-flex items-center gap-2 text-sm text-gdg-blue">
          <ArrowLeft className="h-4 w-4" />
          Back to calendar
        </Link>
        <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  const canDuplicate = isOrganiser;
  const canEdit =
    user?.role === 'admin' ||
    (user?.role === 'domain_head' &&
      (event.owner?._id === user.id ||
        event.owner === user.id ||
        event.team?.some((m) => (m._id || m) === user.id)));

  const handleDuplicate = async () => {
    setBusy(true);
    try {
      const copy = await duplicateEventRequest(event._id);
      showToast('Event duplicated', 'success');
      navigate(`/events/${copy._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to duplicate event');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteEventRequest(event._id);
      showToast('Event deleted', 'info');
      navigate('/calendar');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
      setBusy(false);
    }
  };

  const regPct =
    event.capacity && attendance
      ? Math.min(100, Math.round((attendance.registered / event.capacity) * 100))
      : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="relative h-36 bg-gradient-to-r from-gdg-blue/80 via-indigo-500/70 to-gdg-green/80 p-5">
          {event.posterUrl && (
            <img
              src={event.posterUrl}
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="relative z-10 flex items-center justify-between">
            <Link
              to="/calendar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-900 backdrop-blur-xs hover:bg-white"
              aria-label="Back to calendar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              <span className="rounded-full bg-white/90 px-3 py-0.5 text-xs font-semibold capitalize text-slate-900">
                {event.type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                {event.title}
              </h1>
              <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">/{event.slug}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/events/${event._id}/live`}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <Radio className="h-4 w-4 text-gdg-green" />
                Live view
              </Link>
              {canDuplicate && (
                <>
                  <Link
                    to={`/events/${event._id}/checkin`}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                  >
                    <QrCode className="h-4 w-4 text-gdg-blue" />
                    Check-in
                  </Link>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleDuplicate}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] disabled:opacity-60"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                </>
              )}
              {canEdit && (
                <Link
                  to={`/events/${event._id}/edit`}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-gdg-blue px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              )}
              {user?.role === 'admin' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleDelete}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-gdg-red/30 px-3.5 py-2 text-xs font-medium text-gdg-red hover:bg-gdg-red/10 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-4 border-t border-[var(--border-subtle)] pt-5 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gdg-blue" />
              <div className="text-sm">
                <p className="font-medium text-[var(--text-primary)]">{formatIST(event.startAt)}</p>
                <p className="text-xs text-[var(--text-muted)]">to {formatIST(event.endAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gdg-red" />
              <div className="text-sm">
                <p className="font-medium text-[var(--text-primary)]">{event.venue || 'TBD'}</p>
                {event.venue && !event.venue.startsWith('http') && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gdg-blue hover:underline"
                  >
                    Open in Maps <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="text-sm">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-gdg-green" />
                  {attendance
                    ? `${attendance.registered} registered (${attendance.checkedIn} checked in)`
                    : event.capacity
                      ? `Capacity ${event.capacity}`
                      : 'Open capacity'}
                </span>
              </div>
              {regPct !== null && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                  <div
                    className="h-full rounded-full bg-gdg-green"
                    style={{ width: `${regPct}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-b border-[var(--border-subtle)]">
        <nav className="flex gap-6" aria-label="Event sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === tab.key
                  ? 'border-gdg-blue text-gdg-blue'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Overview</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-[var(--text-secondary)]">
              {event.description || 'No description added yet.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border-subtle)] pt-4 text-xs text-[var(--text-muted)]">
              <span>Public page: {event.isPublic ? 'Enabled' : 'Hidden'}</span>
              <span>·</span>
              <span>Registration: {event.registrationOpen ? 'Open' : 'Closed'}</span>
              <span>·</span>
              <span>
                Tasks: {event.taskSummary?.done || 0} / {event.taskSummary?.total || 0} done
              </span>
              {event.isPublic && (
                <>
                  <span>·</span>
                  <Link to={`/e/${event.slug}`} className="font-medium text-gdg-blue hover:underline">
                    View public registration page
                  </Link>
                </>
              )}
            </div>
          </div>

          <TaskBoard eventId={event._id} canEdit={canEdit} />
        </div>
      )}

      {activeTab === 'runsheet' && (
        <div className="space-y-6">
          {event.sessions?.length > 0 && (
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
              <h2 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
                Event timeline
              </h2>
              <ol className="relative space-y-4 border-l-2 border-gdg-blue/30 pl-5">
                {event.sessions.map((s) => (
                  <li key={s._id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-gdg-blue ring-4 ring-[var(--bg-surface)]" />
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      Day {s.day} · {formatIST(s.startAt, 'hh:mm a')} — {formatIST(s.endAt, 'hh:mm a')}
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{s.title}</p>
                    {s.speaker && <p className="text-xs text-[var(--text-secondary)]">{s.speaker}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <RunSheetEditor event={event} canEdit={canEdit} />
        </div>
      )}

      {activeTab === 'speakers' && (
        speakers.length === 0 ? (
          <EmptyState
            icon={Mic}
            title="No speakers listed yet"
            description="Add speakers to sessions in the Run sheet tab to showcase them here."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((sp) => (
              <div
                key={sp.name}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gdg-blue/15 font-display text-base font-bold text-gdg-blue">
                    {sp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{sp.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {sp.sessions.length} session{sp.sessions.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-secondary)]">
                  {sp.sessions.map((title, i) => (
                    <li key={i}>• {title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'team' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {event.owner && (
            <div className="rounded-2xl border border-gdg-blue/30 bg-[var(--bg-surface)] p-5">
              <span className="rounded-full bg-gdg-blue/10 px-2.5 py-0.5 text-[11px] font-semibold text-gdg-blue">
                Event owner
              </span>
              <h3 className="mt-2 text-base font-bold text-[var(--text-primary)]">
                {event.owner.name}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{event.owner.email}</p>
              <p className="mt-1 text-xs capitalize text-[var(--text-secondary)]">
                {event.owner.domain} domain
              </p>
            </div>
          )}
          {(event.team || []).map((member) => (
            <div
              key={member._id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5"
            >
              <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-secondary)]">
                Organiser
              </span>
              <h3 className="mt-2 text-base font-bold text-[var(--text-primary)]">{member.name}</h3>
              <p className="text-xs text-[var(--text-muted)]">{member.email}</p>
              <p className="mt-1 text-xs capitalize text-[var(--text-secondary)]">
                {member.domain} domain
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Registrations ({registrations.length})
            </h2>
            {isOrganiser && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadBlob(
                      `/events/${id}/registrations?format=csv`,
                      `registrations-${event.slug}.csv`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadBlob(`/events/${id}/certificates.zip`, `certificates-${event.slug}.zip`)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                >
                  <Award className="h-3.5 w-3.5 text-gdg-blue" />
                  Certificates ZIP
                </button>
              </div>
            )}
          </div>
          {registrations.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No registrations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--border-subtle)] text-xs uppercase text-[var(--text-muted)]">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Branch / Year</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {registrations.map((reg) => (
                    <tr key={reg._id}>
                      <td className="py-2.5 pr-4 font-medium text-[var(--text-primary)]">
                        {reg.name}
                      </td>
                      <td className="py-2.5 pr-4 text-[var(--text-secondary)]">{reg.email}</td>
                      <td className="py-2.5 pr-4 text-[var(--text-muted)]">
                        {[reg.branch, reg.year].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="py-2.5">
                        {reg.checkedInAt ? (
                          <span className="rounded-full bg-gdg-green/15 px-2.5 py-0.5 text-xs font-medium text-gdg-green">
                            Checked in
                          </span>
                        ) : (
                          <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                            Registered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                Post-event feedback & report
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Average rating: {feedbackData?.summary?.averageRating ?? 0} / 5 (
                {feedbackData?.summary?.count ?? 0} responses)
                {reportData ? ` · No-show rate: ${reportData.noShowRate}%` : ''}
              </p>
            </div>
            {isOrganiser && (
              <button
                type="button"
                onClick={() =>
                  downloadBlob(`/events/${id}/report?format=pdf`, `report-${event.slug}.pdf`)
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              >
                <FileBarChart className="h-4 w-4 text-gdg-blue" />
                Download report PDF
              </button>
            )}
          </div>

          <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            {!feedbackData || feedbackData.items.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No feedback submitted yet.</p>
            ) : (
              feedbackData.items.map((fb) => (
                <div key={fb._id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-semibold text-amber-500">Rating: {fb.rating} / 5</p>
                  {fb.liked && (
                    <p className="mt-1 text-sm text-[var(--text-primary)]">Liked: {fb.liked}</p>
                  )}
                  {fb.improve && (
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      Improve: {fb.improve}
                    </p>
                  )}
                  {fb.comments && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{fb.comments}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
