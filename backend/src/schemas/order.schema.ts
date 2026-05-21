import { z } from 'zod';

export const bookOrderSchema = z.object({
  body: z.object({
    package_id: z.string().regex(/^\d+$/, 'package_id must be a numeric string representing package ID'),
    payment_method: z.enum(['CARD']),
    additional_details: z.string().optional()
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'CHANGES_REQUIRED'])
  })
});
