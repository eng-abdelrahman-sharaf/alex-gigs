import { z } from 'zod';

const packageSchemaInput = z.object({
  type: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  title: z.string().max(255),
  descr: z.string(),
  delivery_time: z.number().int().positive(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid decimal pricing e.g. 10.00'),
  deliverables: z.array(z.string())
});

export const createGigSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(255),
    descr: z.string().optional(),
    tags: z.array(z.string()).optional(),
    portfolio: z.array(z.string()).optional(),
    packages: z.array(packageSchemaInput).optional()
  })
});

export const updateGigSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(255).optional(),
    descr: z.string().optional(),
    tags: z.array(z.string()).optional(),
    portfolio: z.array(z.string()).optional()
  })
});

export const searchGigSchema = z.object({
  query: z.object({
    tag: z.string().optional(),
    search: z.string().optional(),
    limit: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional(),
    offset: z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10)).optional()
  })
});

export const addFaqSchema = z.object({
  body: z.object({
    question: z.string().min(3),
    answer: z.string().min(3)
  })
});

export const addPackageSchema = z.object({
  body: packageSchemaInput
});

export const updatePackageSchema = z.object({
  body: packageSchemaInput.omit({ type: true }).partial()
});
