'use client';

import { useState } from 'react';

import { TaskFormSheet } from '@/app/(main)/_components/task-form-sheet';
import { DateNav } from '@/components/date-nav';
import { TaskItem } from '@/components/task-item';
import { useCreateTask, useDeleteTask, useGetTasks, useUpdateTask } from '@/hooks/apis/tasks';
import type { Task } from '@/hooks/apis/tasks/types';
import { useGetCurrentUser } from '@/hooks/apis/users';
import { greeting, todayISO } from '@/utils/date';

export default function TodayPage() {
  const { data: user } = useGetCurrentUser();
  const [date, setDate] = useState(todayISO);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const tasksQuery = useGetTasks(date);
  const createMutation = useCreateTask(date);
  const toggleMutation = useUpdateTask(date);
  const deleteMutation = useDeleteTask(date);

  const tasks = tasksQuery.data ?? [];
  const remaining = tasks.filter((task) => !task.done).length;
  const timedCount = tasks.filter((task) => task.startTime).length;
  const highPriorityCount = tasks.filter(
    (task) => !task.done && task.priority === 'HIGH'
  ).length;

  function openEditSheet(task: Task) {
    setEditingTask(task);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTask(null);
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

      <DateNav value={date} onChange={setDate} />

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

      <div className='mt-5 flex items-end justify-between'>
        <h2 className='text-base font-semibold'>Tasks</h2>

        <p className='text-xs text-muted'>
          {tasks.length === 0 ? 'None yet' : `${remaining} left`}
        </p>
      </div>

      {tasksQuery.isLoading ? (
        <p className='mt-6 text-center text-sm text-muted'>Loading tasks...</p>
      ) : tasksQuery.isError ? (
        <p className='mt-6 text-center text-sm text-red-500'>
          {tasksQuery.error instanceof Error ? tasksQuery.error.message : 'Could not load tasks'}
        </p>
      ) : tasks.length === 0 ? (
        <div className='mt-8 rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
          <p className='font-medium'>No tasks for this day</p>

          <p className='mt-1 text-sm text-muted'>Add one from the Add tab.</p>
        </div>
      ) : (
        <ul className='mt-3 space-y-2'>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(item: Task) =>
                toggleMutation.mutate({ id: item.id, payload: { done: !item.done } })
              }
              onDelete={(item: Task) => deleteMutation.mutate(item.id)}
              onEdit={openEditSheet}
              onAddSubtask={async (parent, title) => {
                await createMutation.mutateAsync({
                  title,
                  date,
                  parentId: parent.id,
                });
              }}
              busy={
                toggleMutation.isPending || deleteMutation.isPending || createMutation.isPending
              }
            />
          ))}
        </ul>
      )}

      <TaskFormSheet
        key={sheetKey}
        open={sheetOpen}
        date={date}
        task={editingTask}
        onClose={closeSheet}
      />
    </>
  );
}
