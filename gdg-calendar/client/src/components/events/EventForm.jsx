import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fromISTInputValue, toISTInputValue } from '../../utils/dates.js';
import { EVENT_STATUSES, EVENT_TYPES } from '../../utils/statusColors.js';
import TemplateSelect from './TemplateSelect.jsx';

const eventFormSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters'),
    type: z.enum(EVENT_TYPES.map((t) => t.value)),
    status: z.enum(EVENT_STATUSES.map((s) => s.value)),
    venue: z.string().trim().optional(),
    description: z.string().trim().optional(),
    startAt: z.string().min(1, 'Start date & time is required'),
    endAt: z.string().min(1, 'End date & time is required'),
    capacity: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const n = Number(val);
        return Number.isNaN(n) ? undefined : n;
      }),
    isPublic: z.boolean().optional(),
    registrationOpen: z.boolean().optional(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

export default function EventForm({
  initialEvent = null,
  defaultDate = '',
  templates = [],
  onSubmit,
  submitting = false,
  submitLabel = 'Save event',
}) {
  const [templateId, setTemplateId] = useState('');
  const defaultStart = defaultDate
    ? `${defaultDate}T10:00`
    : initialEvent?.startAt
      ? toISTInputValue(initialEvent.startAt)
      : '';
  const defaultEnd = defaultDate
    ? `${defaultDate}T12:00`
    : initialEvent?.endAt
      ? toISTInputValue(initialEvent.endAt)
      : '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialEvent?.title || '',
      type: initialEvent?.type || 'workshop',
      status: initialEvent?.status || 'planned',
      venue: initialEvent?.venue || '',
      description: initialEvent?.description || '',
      startAt: defaultStart,
      endAt: defaultEnd,
      capacity: initialEvent?.capacity || '',
      isPublic: Boolean(initialEvent?.isPublic),
      registrationOpen: Boolean(initialEvent?.registrationOpen),
    },
  });

  useEffect(() => {
    if (initialEvent) {
      reset({
        title: initialEvent.title || '',
        type: initialEvent.type || 'workshop',
        status: initialEvent.status || 'planned',
        venue: initialEvent.venue || '',
        description: initialEvent.description || '',
        startAt: toISTInputValue(initialEvent.startAt),
        endAt: toISTInputValue(initialEvent.endAt),
        capacity: initialEvent.capacity || '',
        isPublic: Boolean(initialEvent.isPublic),
        registrationOpen: Boolean(initialEvent.registrationOpen),
      });
    }
  }, [initialEvent, reset]);

  const handleFormSubmit = (values) => {
    const payload = {
      ...values,
      startAt: fromISTInputValue(values.startAt),
      endAt: fromISTInputValue(values.endAt),
    };
    if (!payload.capacity) {
      delete payload.capacity;
    }
    if (!initialEvent && templateId) {
      payload.templateId = templateId;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Event title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            placeholder="e.g. Build with AI Workshop"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.title && <p className="mt-1 text-xs text-gdg-red">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Event type
          </label>
          <select
            id="type"
            {...register('type')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {EVENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startAt" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Start (IST)
          </label>
          <input
            id="startAt"
            type="datetime-local"
            {...register('startAt')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.startAt && <p className="mt-1 text-xs text-gdg-red">{errors.startAt.message}</p>}
        </div>

        <div>
          <label htmlFor="endAt" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            End (IST)
          </label>
          <input
            id="endAt"
            type="datetime-local"
            {...register('endAt')}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {errors.endAt && <p className="mt-1 text-xs text-gdg-red">{errors.endAt.message}</p>}
        </div>

        <div>
          <label htmlFor="venue" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Venue / Meeting link
          </label>
          <input
            id="venue"
            type="text"
            {...register('venue')}
            placeholder="Main Auditorium or Meet URL"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Capacity (optional)
          </label>
          <input
            id="capacity"
            type="number"
            min="1"
            {...register('capacity')}
            placeholder="120"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            placeholder="Agenda, target audience, prerequisites..."
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-1">
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            {...register('isPublic')}
            className="h-4 w-4 rounded border-[var(--border-subtle)] text-gdg-blue focus:ring-gdg-blue"
          />
          Show on public event page
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            {...register('registrationOpen')}
            className="h-4 w-4 rounded border-[var(--border-subtle)] text-gdg-blue focus:ring-gdg-blue"
          />
          Registration open
        </label>
      </div>

      {!initialEvent && templates.length > 0 && (
        <TemplateSelect templates={templates} value={templateId} onChange={setTemplateId} />
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gdg-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

