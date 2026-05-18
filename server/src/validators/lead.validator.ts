import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const status = z.enum(['New', 'Contacted', 'Qualified', 'Lost']);
const source = z.enum(['Website', 'Instagram', 'Referral']);

export const leadParamsSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const leadQuerySchema = z.object({
  query: z.object({
    status: status.optional(),
    source: source.optional(),
    search: z.string().trim().max(120).optional(),
    sort: z.enum(['latest', 'oldest']).default('latest'),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(10).default(10),
  }),
});

export const createLeadSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Enter a valid email').toLowerCase(),
    status: status.default('New'),
    source,
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    id: objectId,
  }),
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      email: z.string().trim().email().toLowerCase().optional(),
      status: status.optional(),
      source: source.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'At least one field must be provided',
    }),
});
