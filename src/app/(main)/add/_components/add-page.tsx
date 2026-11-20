'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';

import { TaskFormSheet } from '@/app/(main)/_components/task-form-sheet';
import { DateNav } from '@/components/date-nav';
import { TaskItem } from '@/components/task-item';
import { useCreateTask, useDeleteTask, useGetTasks, useUpdateTask } from '@/hooks/apis/tasks';
import type { Task } from '@/hooks/apis/tasks/types';
import { todayISO } from '@/utils/date';

export default function AddPage() {
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

  function openCreateSheet() {
    setEditingTask(null);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

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
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>Plan</h1>

          <p className='mt-1 text-sm text-muted'>Pick a day, then add tasks when you need them.</p>
        </div>

        <button
          type='button'
          onClick={openCreateSheet}
          className='inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark'
        >
          <Plus size={16} />
          New
        </button>
      </div>

      <div className='mt-4'>
        <DateNav value={date} onChange={setDate} />
      </div>

      <div className='mt-5 flex items-end justify-between'>
        <h2 className='text-base font-semibold'>Tasks</h2>

        <p className='text-xs text-muted'>
          {tasks.length === 0 ? 'None yet' : `${remaining} left`}
        </p>
      </div>

      {tasksQuery.isLoading ? (
        <p className='mt-6 text-center text-sm text-muted'>Loading...</p>
      ) : tasks.length === 0 ? (
        <div className='mt-8 rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
          <p className='font-medium'>No tasks for this day</p>

          <p className='mt-1 text-sm text-muted'>Tap New to create your first one.</p>

          <button
            type='button'
            onClick={openCreateSheet}
            className='mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white'
          >
            <Plus size={16} />
            Add a task
          </button>
        </div>
      ) : (
        <ul className='mt-3 space-y-2 pb-4'>
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
                deleteMutation.isPending || toggleMutation.isPending || createMutation.isPending
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
