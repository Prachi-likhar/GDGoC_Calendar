import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Calendar, CalendarPlus, MapPin } from 'lucide-react';
import { getPublicEventRequest, registerPublicEventRequest } from '../../api/public.js';
import Loader from '../../components/common/Loader.jsx';
import ConfettiBurst from '../../components/common/ConfettiBurst.jsx';
import { formatIST } from '../../utils/dates.js';
import { getEventCoverGradient } from '../../utils/statusColors.js';
import RegisterSuccess from './RegisterSuccess.jsx';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().optional(),
  branch: z.string().trim().optional(),
  year: z.string().trim().optional(),
});

function buildGoogleCalendarUrl(event) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(event.startAt)}/${fmt(event.endAt)}`,
    details: event.description || '',
    location: event.venue || '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function PublicEventPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', branch: '', year: '' },
  });

  useEffect(() => {
    getPublicEventRequest(slug)
      .then((data) => setEvent(data))
      .catch((err) => setError(err.response?.data?.message || 'Event not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const onSubmit = async (values) => {
    setRegError('');
    try {
      const data = await registerPublicEventRequest(slug, values);
      setRegResult(data);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)]">
        <Loader label="Loading event..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] px-4 py-12">
        <div className="mx-auto max-w-xl">
          <Link to="/e" className="inline-flex items-center gap-1.5 text-sm font-medium text-gdg-blue hover:underline">
            <ArrowLeft className="h-4 w-4" />
            All events
          </Link>
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error || 'Event not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
        <ConfettiBurst trigger={Boolean(regResult)} />

        <Link to="/e" className="inline-flex items-center gap-1.5 text-sm font-medium text-gdg-blue hover:underline">
          <ArrowLeft className="h-4 w-4" />
          All public events
        </Link>

        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
          <div className={`h-28 w-full bg-gradient-to-r ${getEventCoverGradient(event.type)}`} />
          <div className="p-6">
            <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium capitalize text-gdg-blue dark:bg-blue-950/50">
              {event.type.replace('_', ' ')}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {event.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                {formatIST(event.startAt)} — {formatIST(event.endAt)}
              </span>
              {event.venue && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                  {event.venue}
                </span>
              )}
            </div>

            <div className="mt-4">
              <a
                href={buildGoogleCalendarUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)]"
              >
                <CalendarPlus className="h-4 w-4 text-gdg-blue" />
                Add to Google Calendar
              </a>
            </div>

            {event.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                {event.description}
              </p>
            )}
          </div>
        </div>

        {event.sessions?.length > 0 && (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <h2 className="font-heading text-base font-semibold text-[var(--text-primary)]">
              Schedule
            </h2>
            <div className="mt-3 divide-y divide-[var(--border-subtle)]">
              {event.sessions.map((s) => (
                <div key={s._id} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{s.title}</p>
                    {s.speaker && <p className="text-xs text-[var(--text-secondary)]">{s.speaker}</p>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Day {s.day} · {formatIST(s.startAt, 'hh:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {regResult ? (
          <RegisterSuccess result={regResult} />
        ) : event.registrationOpen ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">
              Register for this event
            </h2>
            {regError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {regError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
              <div>
                <label htmlFor="reg-name" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  {...register('name')}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-gdg-red">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  {...register('email')}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-gdg-red">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-phone" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Phone (optional)
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  {...register('phone')}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="reg-branch" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    Branch
                  </label>
                  <input
                    id="reg-branch"
                    type="text"
                    placeholder="CSE"
                    {...register('branch')}
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="reg-year" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                    Year
                  </label>
                  <input
                    id="reg-year"
                    type="text"
                    placeholder="2"
                    {...register('year')}
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gdg-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60"
                >
                  {isSubmitting ? 'Registering...' : 'Complete registration'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
            Registration is currently closed for this event.
          </div>
        )}
      </div>
    </div>
  );
}

