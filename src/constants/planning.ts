import type { RecurrenceFrequency, TaskPriority } from '@/hooks/apis/tasks/types';

export const TASK_PRIORITIES: Array<{
  value: TaskPriority;
  label: string;
}> = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export const RECURRENCE_OPTIONS: Array<{
  value: RecurrenceFrequency;
  label: string;
}> = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
};
