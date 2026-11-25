import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarOff, Trash2 } from 'lucide-react';
import {
  createBlockedDateRequest,
  deleteBlockedDateRequest,
  listBlockedDatesRequest,
} from '../api/blockedDates.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useToast } from '../hooks/useToast.js';
import { formatISTDateOnly, fromISTInputValue } from '../utils/dates.js';

const blockedSchema = z
  .object({
    title: z.string().trim().min(2, 'Title is required'),
    reason: z.enum(['exam', 'holiday', 'college_event']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export default function BlockedDates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blockedSchema),
    defaultValues: { title: '', reason: 'exam', startDate: '', endDate: '' },
  });

  const loadBlockedDates = useCallback(async () => {
    try {
      setError('');
      const data = await listBlockedDatesRequest();
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlockedDates();
  }, [loadBlockedDates]);

  const onSubmit = async (values) => {
    try {
      setError('');
      await createBlockedDateRequest({
        title: values.title,
        reason: values.reason,
        startDate: fromISTInputValue(`${values.startDate}T00:00`),
        endDate: fromISTInputValue(`${values.endDate}T23:59`),
      });
      reset();
      toast('Blocked date added', 'success');
      await loadBlockedDates();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add blocked date';
      setError(msg);
      toast(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlockedDateRequest(id);
      toast('Blocked date removed', 'info');
      await loadBlockedDates();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete blocked date';
      setError(msg);
      toast(msg, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
          Blocked dates
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Block exam periods, holidays, and major college events. These appear shaded on the calendar and trigger conflict warnings.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:grid-cols-4"
        noValidate
      >
        <div className="sm:col-span-2">
          <label htmlFor="bd-title" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Title
          </label>
          <input
            id="bd-title"
            type="text"
            {...register('title')}
            placeholder="e.g. End-Sem Exams"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-gdg-red">{errors.title.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="bd-reason" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Reason
          </label>
          <select
            id="bd-reason"
            {...register('reason')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          >
            <option value="exam">Exam</option>
            <option value="holiday">Holiday</option>
            <option value="college_event">College event</option>
          </select>
        </div>

        <div>
          <label htmlFor="bd-start" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Start date
          </label>
          <input
            id="bd-start"
            type="date"
            {...register('startDate')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-gdg-red">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bd-end" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            End date
          </label>
          <input
            id="bd-end"
            type="date"
            {...register('endDate')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
          />
          {errors.endDate && <p className="mt-1 text-xs text-gdg-red">{errors.endDate.message}</p>}
        </div>

        <div className="flex items-end sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting ? 'Adding...' : 'Add blocked date'}
          </button>
        </div>
      </form>

      {loading ? (
        <Loader label="Loading blocked dates..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No blocked dates yet"
          description="Add exam periods or campus holidays above to prevent scheduling clashes."
        />
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          {items.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-gdg-red dark:bg-red-950/50">
                  <CalendarOff className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {formatISTDateOnly(item.startDate)} — {formatISTDateOnly(item.endDate)} ·{' '}
                    <span className="capitalize">{item.reason.replace('_', ' ')}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item._id)}
                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-red-50 hover:text-gdg-red dark:hover:bg-red-950/50"
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

