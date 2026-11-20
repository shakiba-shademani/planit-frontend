import { z } from 'zod';

export const habitFormValidator = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  frequency: z.enum(['DAILY', 'WEEKLY']),
  active: z.boolean(),
});

export type HabitFormValues = z.infer<typeof habitFormValidator>;
