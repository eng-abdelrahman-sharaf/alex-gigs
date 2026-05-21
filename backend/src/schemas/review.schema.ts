import { z } from 'zod';

export const submitReviewSchema = z.object({
  body: z.object({
    order_id: z.string().regex(/^\d+$/, 'order_id must be a numeric string representing order ID'),
    descr: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    created_by: z.enum(['BUYER', 'FREELANCER'])
  })
});
