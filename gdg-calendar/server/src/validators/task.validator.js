import { z } from 'zod';
import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js';
import { USER_DOMAINS } from '../models/User.js';

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, 'Task title is required'),
  domain: z.enum(USER_DOMAINS),
  assignee: z.string().nullable().optional(),
  dueDate: z.coerce.date(),
  status: z.enum(TASK_STATUSES).optional().default('todo'),
  priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).optional(),
  domain: z.enum(USER_DOMAINS).optional(),
  assignee: z.string().nullable().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});

