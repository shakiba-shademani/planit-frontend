'use client';

import { useState } from 'react';

import { Bell, Check, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';

import { PRIORITY_STYLES } from '@/constants/planning';
import type { Task } from '@/hooks/apis/tasks/types';
import { formatReminder } from '@/utils/reminder';

type TaskItemProps = {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onAddSubtask?: (parent: Task, title: string) => Promise<void> | void;
  busy?: boolean;
};

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  busy,
}: TaskItemProps) {
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const reminderLabel = formatReminder(task.reminderAt);
  const timeLabel =
    task.startTime && task.endTime
      ? `${task.startTime} – ${task.endTime}`
      : task.startTime
        ? task.startTime
        : null;

  async function handleAddSubtask() {
    const title = subtaskTitle.trim();
    if (!title || !onAddSubtask) return;

    setAddingSubtask(true);
    try {
      await onAddSubtask(task, title);
      setSubtaskTitle('');
    } finally {
      setAddingSubtask(false);
    }
  }

  return (
    <li className='rounded-2xl border border-line bg-card px-3 py-3 shadow-sm'>
      <div className='flex items-start gap-3'>
        <button
          type='button'
          disabled={busy}
          onClick={() => onToggle(task)}
          aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
            task.done
              ? 'border-primary bg-primary text-white'
              : 'border-slate-300 bg-transparent text-transparent dark:border-slate-500'
          }`}
        >
          <Check size={16} />
        </button>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <button
              type='button'
              disabled={busy || !onEdit}
              onClick={() => onEdit?.(task)}
              className={`min-w-0 flex-1 text-left text-sm font-medium ${
                task.done ? 'text-muted line-through' : 'text-foreground'
              }`}
            >
              {task.title}
            </button>

            <div className='flex shrink-0 items-center'>
              {onEdit ? (
                <button
                  type='button'
                  disabled={busy}
                  aria-label='Edit task'
                  onClick={() => onEdit(task)}
                  className='rounded-lg p-1.5 text-muted hover:bg-background hover:text-primary'
                >
                  <Pencil size={15} />
                </button>
              ) : null}

              <button
                type='button'
                disabled={busy}
                aria-label='Delete task'
                onClick={() => onDelete(task)}
                className='rounded-lg p-1.5 text-muted hover:bg-background hover:text-red-500'
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {task.notes ? <p className='mt-1 text-xs text-muted'>{task.notes}</p> : null}

          <div className='mt-2 flex flex-wrap items-center gap-1.5'>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[task.priority]}`}>
              {task.priority.toLowerCase()}
            </span>

            {timeLabel ? (
              <span className='rounded-full bg-background px-2 py-0.5 text-[11px] text-muted'>
                {timeLabel}
              </span>
            ) : null}

            {task.project ? (
              <span
                className='rounded-full px-2 py-0.5 text-[11px] font-medium text-white'
                style={{ backgroundColor: task.project.color ?? '#2563eb' }}
              >
                {task.project.name}
              </span>
            ) : null}

            {task.tags.map((tag) => (
              <span
                key={tag.id}
                className='rounded-full px-2 py-0.5 text-[11px] font-medium'
                style={{
                  backgroundColor: tag.color ? `${tag.color}22` : '#e2e8f0',
                  color: tag.color ?? '#475569',
                }}
              >
                #{tag.name}
              </span>
            ))}

            {task.recurrence !== 'NONE' ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[11px] text-muted'>
                <Repeat size={11} />

                {task.recurrence.toLowerCase()}
              </span>
            ) : null}

            {reminderLabel ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5 text-[11px] text-muted'>
                <Bell size={11} />

                {reminderLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {task.subtasks.length > 0 ? (
        <ul className='mt-3 space-y-2 border-t border-line pt-3'>
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className='flex items-center gap-2 pl-2'>
              <button
                type='button'
                disabled={busy}
                onClick={() => onToggle(subtask)}
                aria-label={subtask.done ? 'Mark subtask as not done' : 'Mark subtask as done'}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  subtask.done
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-300 bg-transparent text-transparent dark:border-slate-500'
                }`}
              >
                <Check size={12} />
              </button>

              <p
                className={`min-w-0 flex-1 text-xs ${
                  subtask.done ? 'text-muted line-through' : 'text-foreground'
                }`}
              >
                {subtask.title}
              </p>

              <button
                type='button'
                disabled={busy}
                aria-label='Delete subtask'
                onClick={() => onDelete(subtask)}
                className='rounded-lg p-1 text-muted hover:bg-background hover:text-red-500'
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {onAddSubtask && !task.parentId ? (
        <div className='mt-3 flex items-center gap-2 border-t border-line pt-3'>
          <input
            value={subtaskTitle}
            onChange={(event) => setSubtaskTitle(event.target.value)}
            placeholder='Add a subtask'
            className='h-9 min-w-0 flex-1 rounded-lg border border-line bg-background px-2 text-xs outline-none ring-primary focus:ring-2'
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleAddSubtask();
              }
            }}
          />

          <button
            type='button'
            disabled={busy || addingSubtask || !subtaskTitle.trim()}
            onClick={() => void handleAddSubtask()}
            className='inline-flex h-9 items-center gap-1 rounded-lg bg-background px-2 text-xs font-medium text-primary disabled:opacity-50'
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      ) : null}
    </li>
  );
}
