import { z } from 'zod';
import { BLOCKED_REASONS } from '../models/BlockedDate.js';

export const createBlockedDateSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must be at least 2 characters'),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.enum(BLOCKED_REASONS),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

