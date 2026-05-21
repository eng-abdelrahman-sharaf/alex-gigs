import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(100),
    email: z.string().email().max(255),
    password: z.string().min(6),
    fname: z.string().max(100).optional(),
    lname: z.string().max(100).optional(),
    overview: z.string().optional(),
    country: z.string().max(100).optional(),
    languages: z.array(z.string()).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or username is required'),
    password: z.string().min(1, 'Password is required')
  })
});
