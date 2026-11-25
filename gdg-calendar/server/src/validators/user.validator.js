import { z } from 'zod';
import { USER_DOMAINS, USER_ROLES } from '../models/User.js';

export const updateUserSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  domain: z.enum(USER_DOMAINS).optional(),
  isActive: z.boolean().optional(),
});

