import { z } from 'zod';

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:mm')
  .or(z.literal(''));

export const taskFormValidator = z
  .object({
    title: z.string().min(1, 'Please enter a task').max(200),
    notes: z.string().max(2000).optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    reminderAt: z.string().optional(),
    recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
    projectId: z.string().uuid().or(z.literal('')).optional(),
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.endTime >= data.startTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export type TaskFormValues = z.infer<typeof taskFormValidator>;
