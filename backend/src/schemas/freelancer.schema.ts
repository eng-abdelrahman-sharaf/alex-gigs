import { z } from 'zod';

export const onboardSchema = z.object({
  body: z.object({
    job_title: z.string().max(255).optional(),
    overview: z.string().optional()
  })
});

export const updateFreelancerSchema = z.object({
  body: onboardSchema.shape.body
});

export const setAvailabilitySchema = z.object({
  body: z.object({
    start_day: z.string().max(20).optional(),
    end_day: z.string().max(20).optional(),
    start_hour: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Format must be HH:MM or HH:MM:SS').optional(),
    end_hour: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, 'Format must be HH:MM or HH:MM:SS').optional()
  })
});
