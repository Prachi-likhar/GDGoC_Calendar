import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Moon, Search, Sun } from 'lucide-react';
import { listPublicEventsRequest } from '../../api/public.js';
import BracketMark from '../../components/common/BracketMark.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Loader from '../../components/common/Loader.jsx';
import EventCard from '../../components/events/EventCard.jsx';
import { useTheme } from '../../hooks/useTheme.js';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'tech', label: 'Tech' },
  { key: 'design', label: 'Design' },
  { key: 'workshop', label: 'Workshop' },
  { key: 'community', label: 'Community' },
];

export default function PublicEvents() {
  const { isDark, toggleTheme } = useTheme();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listPublicEventsRequest()
      .then((data) => setEvents(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
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
      if (category === 'tech') return ev.type === 'hackathon' || ev.type === 'series';
      if (category === 'design') return ev.title.toLowerCase().includes('design');
      return true;
    });
  }, [events, timeframe, search, category]);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <BracketMark className="h-9 w-9" />
            <div>
              <p className="font-display text-base font-bold text-[var(--text-primary)]">
                GDG on Campus
              </p>
              <p className="text-xs text-[var(--text-muted)]">Discover chapter events</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4 text-gdg-yellow" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link
              to="/login"
              className="rounded-xl bg-gdg-blue px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
            >
              Organiser login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workshops, talks, hackathons..."
              className="min-h-[40px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] pl-9 pr-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium ${category === c.key
                    ? 'bg-gdg-blue text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                  }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-0.5 text-xs">
            {['upcoming', 'past'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`rounded-lg px-3 py-1 capitalize ${timeframe === tf
                    ? 'bg-[var(--bg-surface)] font-semibold text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)]'
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red">
            {error}
          </div>
        )}

        {loading ? (
          <Loader label="Loading upcoming events..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No public events found"
            description="Check back soon or adjust your filters to see more events."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => (
              <EventCard key={ev._id} event={ev} to={`/e/${ev.slug}`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
