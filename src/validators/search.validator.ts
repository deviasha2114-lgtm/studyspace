import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string({ required_error: '"q" is required' }).min(2, '"q" must be at least 2 characters').max(200).trim(),
  type: z.enum(['notes', 'users', 'all'], { errorMap: () => ({ message: '"type" must be one of: notes, users, all' }) }).default('all'),
  limit: z.string().optional().transform((v) => v !== undefined ? parseInt(v, 10) : 10).pipe(z.number().int().min(1).max(25)),
  page: z.string().optional().transform((v) => v !== undefined ? parseInt(v, 10) : 1).pipe(z.number().int().min(1)),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
