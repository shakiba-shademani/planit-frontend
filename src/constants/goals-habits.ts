import type { GoalStatus } from '@/hooks/apis/goals/types';
import type { HabitFrequency } from '@/hooks/apis/habits/types';

export const GOAL_STATUSES: Array<{ value: GoalStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DONE', label: 'Done' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const HABIT_FREQUENCIES: Array<{ value: HabitFrequency; label: string }> = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
];

export const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  DONE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};
