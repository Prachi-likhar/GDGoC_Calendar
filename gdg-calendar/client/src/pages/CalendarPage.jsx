import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, LayoutGrid, Plus, Search } from 'lucide-react';
import { listBlockedDatesRequest } from '../api/blockedDates.js';
import { duplicateEventRequest, listEventsRequest } from '../api/events.js';
import CalendarView from '../components/calendar/CalendarView.jsx';
import EventModal from '../components/calendar/EventModal.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Loader from '../components/common/Loader.jsx';
import EventCard from '../components/events/EventCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { STATUS_COLORS } from '../utils/statusColors.js';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'tech', label: 'Tech' },
  { key: 'design', label: 'Design' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'community', label: 'Community' },
];

export default function CalendarPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canCreate = user?.role === 'admin' || user?.role === 'domain_head';

  const loadCalendar = useCallback(async () => {
    try {
      setError('');
      const [eventsData, blockedData] = await Promise.all([
        listEventsRequest(),
        listBlockedDatesRequest(),
      ]);
      setEvents(eventsData);
      setBlockedDates(blockedData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const handleDateClick = (dateStr) => {
    if (!canCreate) return;
    const dateOnly = dateStr.slice(0, 10);
    navigate(`/events/new?date=${dateOnly}`);
  };

  const handleDuplicate = async (eventId) => {
    try {
      const copy = await duplicateEventRequest(eventId);
      setSelectedEvent(null);
      showToast('Event duplicated', 'success');
      await loadCalendar();
      navigate(`/events/${copy._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to duplicate event');
    }
  };

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter((ev) => {
      if (timeframe === 'upcoming' && new Date(ev.endAt) < now) return false;
      if (timeframe === 'past' && new Date(ev.endAt) >= now) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          ev.title.toLowerCase().includes(q) ||
          (ev.venue || '').toLowerCase().includes(q) ||
          (ev.description || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (category === 'workshop') return ev.type === 'workshop' || ev.type === 'study_jam';
      if (category === 'community') return ev.type === 'meetup' || ev.type === 'talk';
      if (category === 'tech') return ev.owner?.domain === 'tech' || ev.type === 'hackathon';
      if (category === 'design') return ev.owner?.domain === 'design';
      return true;
    });
  }, [events, timeframe, search, category]);

  const canManageSelected =
    selectedEvent &&
    (user?.role === 'admin' ||
      (user?.role === 'domain_head' &&
        (selectedEvent.owner?._id === user.id ||
          selectedEvent.owner === user.id ||
          selectedEvent.team?.some((m) => (m._id || m) === user.id))));

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Events & calendar</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Chapter schedule in IST. Shaded dates indicate exam/holiday blocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'calendar'
                  ? 'bg-gdg-blue text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'cards'
                  ? 'bg-gdg-blue text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Discover
            </button>
          </div>

          {canCreate && (
            <Link
              to="/events/new"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>New event</span>
            </Link>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
          {Object.entries(STATUS_COLORS).map(([status, style]) => (
            <span key={status} className="inline-flex items-center gap-1.5 capitalize">
              <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
              {status}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-red-200 dark:bg-red-900/60" />
            Blocked date
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title or venue..."
              className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] pl-9 pr-3 text-sm text-[var(--text-primary)]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${category === c.key
                    ? 'bg-gdg-blue text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-0.5 text-xs">
            {['upcoming', 'past', 'all'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-2.5 py-1 capitalize ${timeframe === tf
                    ? 'bg-[var(--bg-surface)] font-semibold text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-muted)]'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
          {error}
        </div>
      )}

      {loading ? (
        <Loader label="Loading events..." />
      ) : viewMode === 'calendar' ? (
        <CalendarView
          events={events}
          blockedDates={blockedDates}
          onEventClick={setSelectedEvent}
          onDateClick={handleDateClick}
        />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No matching events"
          description="Try clearing your search or switching category/timeframe filters."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((ev) => (
            <EventCard key={ev._id} event={ev} to={`/events/${ev._id}`} />
          ))}
        </div>
      )}

      <EventModal
        event={selectedEvent}
        canManage={canManageSelected}
        onDuplicate={handleDuplicate}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
