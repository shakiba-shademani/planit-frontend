import { z } from 'zod';

export const goalFormValidator = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  notes: z.string().max(2000).optional(),
  status: z.enum(['ACTIVE', 'DONE', 'ARCHIVED']),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .or(z.literal(''))
    .optional(),
});

export type GoalFormValues = z.infer<typeof goalFormValidator>;
