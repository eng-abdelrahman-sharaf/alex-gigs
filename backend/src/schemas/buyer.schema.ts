import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fname: z.string().max(100).optional(),
    lname: z.string().max(100).optional(),
    overview: z.string().optional(),
    country: z.string().max(100).optional(),
    languages: z.array(z.string()).optional()
  })
});
