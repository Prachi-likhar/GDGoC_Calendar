import { z } from 'zod';

export const publicFeedbackSchema = z.object({
  qrToken: z.string().trim().min(10, 'Valid registration QR token is required'),
  rating: z.coerce.number().int().min(1).max(5),
  liked: z.string().trim().optional().default(''),
  improve: z.string().trim().optional().default(''),
  comments: z.string().trim().optional().default(''),
});

