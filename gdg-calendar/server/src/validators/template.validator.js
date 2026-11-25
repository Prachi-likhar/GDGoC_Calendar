import { z } from 'zod';
import { EVENT_TYPES } from '../models/Event.js';
import { USER_DOMAINS } from '../models/User.js';

const templateTaskSchema = z.object({
  title: z.string().trim().min(2),
  offsetDays: z.coerce.number().int(),
  domain: z.enum(USER_DOMAINS),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

const templateSessionSchema = z.object({
  title: z.string().trim().min(2),
  offsetMinutes: z.coerce.number().int().optional().default(0),
  durationMinutes: z.coerce.number().int().positive().optional().default(60),
});

export const createTemplateSchema = z.object({
  name: z.string().trim().min(2, 'Template name is required'),
  eventType: z.enum(EVENT_TYPES),
  tasks: z.array(templateTaskSchema).optional().default([]),
  defaultSessions: z.array(templateSessionSchema).optional().default([]),
});

export const updateTemplateSchema = createTemplateSchema.partial();

