import { z } from 'zod';

export const publicRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().optional().default(''),
  branch: z.string().trim().optional().default(''),
  year: z.union([z.string(), z.number()]).optional().transform((v) => (v ? String(v) : '')),
});

export const checkInSchema = z.object({
  qrToken: z.string().trim().min(10, 'Valid QR token is required'),
});

