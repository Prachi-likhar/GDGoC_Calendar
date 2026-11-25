import { z } from 'zod';
import { EVENT_STATUSES, EVENT_TYPES } from '../models/Event.js';

export const createEventSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters'),
    type: z.enum(EVENT_TYPES),
    description: z.string().trim().optional().default(''),
    venue: z.string().trim().optional().default(''),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    status: z.enum(EVENT_STATUSES).optional().default('idea'),
    team: z.array(z.string()).optional().default([]),
    posterUrl: z.string().trim().optional().default(''),
    isPublic: z.boolean().optional().default(false),
    registrationOpen: z.boolean().optional().default(false),
    capacity: z.coerce.number().int().positive().optional(),
    templateId: z.string().optional(),
    slug: z.string().trim().optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

export const updateEventSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').optional(),
  type: z.enum(EVENT_TYPES).optional(),
  description: z.string().trim().optional(),
  venue: z.string().trim().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  status: z.enum(EVENT_STATUSES).optional(),
  team: z.array(z.string()).optional(),
  posterUrl: z.string().trim().optional(),
  isPublic: z.boolean().optional(),
  registrationOpen: z.boolean().optional(),
  capacity: z.coerce.number().int().positive().nullable().optional(),
});

export const conflictPreviewQuerySchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    excludeId: z.string().optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

