import type { Task } from '@/hooks/apis/tasks/types';
import { compareISODate } from '@/utils/date';

export function tasksOnDate(tasks: Task[], date: string): Task[] {
  return tasks.filter((task) => task.date === date);
}

export function overdueTasks(tasks: Task[], today: string): Task[] {
  return tasks.filter((task) => !task.done && compareISODate(task.date, today) < 0);
}

export function splitTimedUntimed(tasks: Task[]): {
  timed: Task[];
  untimed: Task[];
} {
  const timed: Task[] = [];
  const untimed: Task[] = [];

  for (const task of tasks) {
    if (task.startTime) {
      timed.push(task);
    } else {
      untimed.push(task);
    }
  }

  timed.sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  return { timed, untimed };
}

export function taskCountByDate(tasks: Task[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const task of tasks) {
    counts[task.date] = (counts[task.date] ?? 0) + 1;
  }

  return counts;
}
