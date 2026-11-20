'use client';

import { useMemo, useState } from 'react';

import { TaskFormSheet } from '@/app/(main)/_components/task-form-sheet';
import { GoalsHabitsOverview } from '@/app/(main)/home/_components/goals-habits-overview';
import { TaskItem } from '@/components/task-item';
import {
  useCreateTask,
  useDeleteTask,
  useGetTasksRange,
  useUpdateTask,
} from '@/hooks/apis/tasks';
import type { Task } from '@/hooks/apis/tasks/types';
import { useGetCurrentUser } from '@/hooks/apis/users';
import {
  endOfWeek,
  formatDayNumber,
  formatShortWeekday,
  greeting,
  shiftISODate,
  startOfWeek,
  todayISO,
  weekDays,
} from '@/utils/date';
import {
  overdueTasks,
  splitTimedUntimed,
  taskCountByDate,
  tasksOnDate,
} from '@/utils/task-groups';

export default function HomePage() {
  const { data: user } = useGetCurrentUser();
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const rangeFrom = shiftISODate(today, -30);
  const rangeTo = endOfWeek(selectedDate);
  const tasksQuery = useGetTasksRange(rangeFrom, rangeTo);
  const createMutation = useCreateTask(selectedDate);
  const toggleMutation = useUpdateTask(selectedDate);
  const deleteMutation = useDeleteTask(selectedDate);

  const tasks = tasksQuery.data ?? [];
  const days = weekDays(selectedDate);
  const counts = useMemo(() => taskCountByDate(tasks), [tasks]);
  const dayTasks = useMemo(() => tasksOnDate(tasks, selectedDate), [tasks, selectedDate]);
  const overdue = useMemo(() => overdueTasks(tasks, today), [tasks, today]);
  const { timed, untimed } = useMemo(() => splitTimedUntimed(dayTasks), [dayTasks]);

  const remaining = dayTasks.filter((task) => !task.done).length;
  const timedCount = timed.length;
  const highPriorityCount = dayTasks.filter(
    (task) => !task.done && task.priority === 'HIGH'
  ).length;

  const busy =
    toggleMutation.isPending || deleteMutation.isPending || createMutation.isPending;

  function openEditSheet(task: Task) {
    setEditingTask(task);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTask(null);
  }

  function handleToggle(task: Task) {
    toggleMutation.mutate({ id: task.id, payload: { done: !task.done } });
  }

  function handleDelete(task: Task) {
    deleteMutation.mutate(task.id);
  }

  async function handleAddSubtask(parent: Task, title: string) {
    await createMutation.mutateAsync({
      title,
      date: parent.date,
      parentId: parent.id,
    });
  }

  return (
    <>
      <header className='mb-5 flex items-center gap-3'>
        <div className='h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt='' className='h-full w-full object-cover' />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-sm font-semibold text-muted'>
              {user?.displayName?.[0]?.toUpperCase() ?? 'T'}
            </div>
          )}
        </div>

        <div className='min-w-0'>
          <p className='text-sm text-muted'>{greeting()}</p>

          <h1 className='truncate text-xl font-semibold'>{user?.displayName}</h1>
        </div>
      </header>

      <div className='grid grid-cols-7 gap-1'>
        {days.map((day) => {
          const selected = day === selectedDate;
          const isToday = day === today;
          const count = counts[day] ?? 0;

          return (
            <button
              key={day}
              type='button'
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center rounded-2xl px-1 py-2 ${
                selected
                  ? 'bg-primary text-white'
                  : 'bg-card text-foreground hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`text-[10px] font-medium uppercase ${
                  selected ? 'text-white/80' : 'text-muted'
                }`}
              >
                {formatShortWeekday(day)}
              </span>

              <span className='mt-1 text-sm font-semibold'>{formatDayNumber(day)}</span>

              <span
                className={`mt-1 h-1.5 w-1.5 rounded-full ${
                  count > 0
                    ? selected
                      ? 'bg-white'
                      : 'bg-primary'
                    : isToday && !selected
                      ? 'bg-line'
                      : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <p className='mt-2 text-center text-xs text-muted'>
        Week of {startOfWeek(selectedDate)}
      </p>

      <div className='mt-4 grid grid-cols-3 gap-2'>
        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <p className='text-[11px] text-muted'>Left</p>

          <p className='mt-1 text-lg font-semibold'>{remaining}</p>
        </div>

        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <p className='text-[11px] text-muted'>Timed</p>

          <p className='mt-1 text-lg font-semibold'>{timedCount}</p>
        </div>

        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <p className='text-[11px] text-muted'>High</p>

          <p className='mt-1 text-lg font-semibold'>{highPriorityCount}</p>
        </div>
      </div>

      <GoalsHabitsOverview />

      {tasksQuery.isLoading ? (
        <p className='mt-6 text-center text-sm text-muted'>Loading tasks...</p>
      ) : tasksQuery.isError ? (
        <p className='mt-6 text-center text-sm text-red-500'>
          {tasksQuery.error instanceof Error
            ? tasksQuery.error.message
            : 'Could not load tasks'}
        </p>
      ) : (
        <div className='mt-5 space-y-6'>
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
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={openEditSheet}
                    onAddSubtask={handleAddSubtask}
                    busy={busy}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {dayTasks.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
              <p className='font-medium'>Nothing planned for this day</p>

              <p className='mt-1 text-sm text-muted'>Add tasks from the Plan tab.</p>
            </div>
          ) : (
            <>
              <section>
                <div className='mb-2 flex items-end justify-between'>
                  <h2 className='text-base font-semibold'>Timeline</h2>

                  <p className='text-xs text-muted'>
                    {timed.length === 0 ? 'None' : `${timed.length} timed`}
                  </p>
                </div>

                {timed.length === 0 ? (
                  <p className='rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted'>
                    No timed tasks for this day
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {timed.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={openEditSheet}
                        onAddSubtask={handleAddSubtask}
                        busy={busy}
                      />
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <div className='mb-2 flex items-end justify-between'>
                  <h2 className='text-base font-semibold'>Anytime</h2>

                  <p className='text-xs text-muted'>
                    {untimed.length === 0 ? 'None' : `${untimed.length}`}
                  </p>
                </div>

                {untimed.length === 0 ? (
                  <p className='rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted'>
                    No untimed tasks for this day
                  </p>
                ) : (
                  <ul className='space-y-2'>
                    {untimed.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={openEditSheet}
                        onAddSubtask={handleAddSubtask}
                        busy={busy}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      )}

      <TaskFormSheet
        key={sheetKey}
        open={sheetOpen}
        date={editingTask?.date ?? selectedDate}
        task={editingTask}
        onClose={closeSheet}
      />
    </>
  );
}
