'use client';

import { useMemo } from 'react';

import { TaskItem } from '@/components/task-item';
import type { Task } from '@/hooks/apis/tasks/types';
import { compareISODate } from '@/utils/date';

type WeeklyReviewProps = {
  tasks: Task[];
  today: string;
  weekStart: string;
  weekEnd: string;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onAddSubtask: (parent: Task, title: string) => Promise<void>;
  busy?: boolean;
};

function tasksInWeek(tasks: Task[], weekStart: string, weekEnd: string) {
  return tasks.filter(
    (task) =>
      compareISODate(task.date, weekStart) >= 0 && compareISODate(task.date, weekEnd) <= 0
  );
}

export function WeeklyReview({
  tasks,
  today,
  weekStart,
  weekEnd,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  busy,
}: WeeklyReviewProps) {
  const weekTasks = useMemo(
    () => tasksInWeek(tasks, weekStart, weekEnd),
    [tasks, weekStart, weekEnd]
  );

  const completed = useMemo(
    () => weekTasks.filter((task) => task.done),
    [weekTasks]
  );

  const overdue = useMemo(
    () =>
      weekTasks.filter(
        (task) => !task.done && compareISODate(task.date, today) < 0
      ),
    [weekTasks, today]
  );

  const remaining = useMemo(
    () =>
      weekTasks.filter(
        (task) => !task.done && compareISODate(task.date, today) >= 0
      ),
    [weekTasks, today]
  );

  const total = weekTasks.length;
  const doneCount = completed.length;
  const progress = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  if (total === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
        <p className='font-medium'>Nothing to review this week</p>
        <p className='mt-1 text-sm text-muted'>Add tasks from the Plan tab.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-line bg-card px-3 py-4'>
        <p className='text-xs font-medium uppercase tracking-wide text-muted'>
          Week progress
        </p>
        <p className='mt-1 text-2xl font-semibold'>
          {doneCount}/{total}
          <span className='ml-2 text-sm font-medium text-muted'>{progress}%</span>
        </p>
        <div className='mt-3 h-2 overflow-hidden rounded-full bg-line'>
          <div
            className='h-full rounded-full bg-primary transition-[width]'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2'>
        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <p className='text-[11px] text-muted'>Done</p>
          <p className='mt-1 text-lg font-semibold'>{doneCount}</p>
        </div>
        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <p className='text-[11px] text-muted'>Left</p>
          <p className='mt-1 text-lg font-semibold'>{remaining.length}</p>
        </div>
        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <p className='text-[11px] text-muted'>Overdue</p>
          <p className='mt-1 text-lg font-semibold'>{overdue.length}</p>
        </div>
      </div>

      {overdue.length > 0 ? (
        <section>
          <div className='mb-2 flex items-end justify-between'>
            <h2 className='text-base font-semibold text-red-600 dark:text-red-400'>
              Overdue
            </h2>
            <p className='text-xs text-muted'>{overdue.length}</p>
          </div>
          <ul className='space-y-2'>
            {overdue.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onAddSubtask={onAddSubtask}
                busy={busy}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {remaining.length > 0 ? (
        <section>
          <div className='mb-2 flex items-end justify-between'>
            <h2 className='text-base font-semibold'>Still open</h2>
            <p className='text-xs text-muted'>{remaining.length}</p>
          </div>
          <ul className='space-y-2'>
            {remaining.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onAddSubtask={onAddSubtask}
                busy={busy}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section>
          <div className='mb-2 flex items-end justify-between'>
            <h2 className='text-base font-semibold'>Completed</h2>
            <p className='text-xs text-muted'>{completed.length}</p>
          </div>
          <ul className='space-y-2'>
            {completed.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onAddSubtask={onAddSubtask}
                busy={busy}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
