import { z } from 'zod';
import { SESSION_STATUSES } from '../models/Session.js';

export const createSessionSchema = z
  .object({
    day: z.coerce.number().int().min(1).optional().default(1),
    title: z.string().trim().min(2, 'Session title is required'),
    speaker: z.string().trim().optional().default(''),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    order: z.coerce.number().int().min(0).optional(),
    notes: z.string().trim().optional().default(''),
    assignee: z.string().nullable().optional(),
    status: z.enum(SESSION_STATUSES).optional().default('upcoming'),
  })
  .refine((d) => d.endAt > d.startAt, {
    message: 'Session end time must be after start time',
    path: ['endAt'],
  });

export const updateSessionSchema = z.object({
  day: z.coerce.number().int().min(1).optional(),
  title: z.string().trim().min(2).optional(),
  speaker: z.string().trim().optional(),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  order: z.coerce.number().int().min(0).optional(),
  notes: z.string().trim().optional(),
  assignee: z.string().nullable().optional(),
  status: z.enum(SESSION_STATUSES).optional(),
});

export const reorderSessionsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        day: z.coerce.number().int().min(1),
        order: z.coerce.number().int().min(0),
      })
    )
    .min(1),
});

