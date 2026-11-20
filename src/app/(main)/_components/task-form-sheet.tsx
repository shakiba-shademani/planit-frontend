'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import {
  taskFormValidator,
  type TaskFormValues,
} from '@/app/(main)/_validators/task-form-validator';
import { BottomSheet } from '@/components/bottom-sheet';
import { RECURRENCE_OPTIONS, TASK_PRIORITIES } from '@/constants/planning';
import { useCreateProject, useGetProjects } from '@/hooks/apis/projects';
import { useCreateTag, useGetTags } from '@/hooks/apis/tags';
import { useCreateTask, useUpdateTask } from '@/hooks/apis/tasks';
import type { Task } from '@/hooks/apis/tasks/types';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/utils/reminder';

const fieldClass =
  'h-11 w-full rounded-xl border border-line bg-background px-3 text-sm outline-none ring-primary focus:ring-2';

const selectClass =
  'h-11 w-full rounded-xl border border-line bg-background pl-3 pr-14 text-sm outline-none ring-primary focus:ring-2';

function getDefaultValues(task?: Task | null): TaskFormValues {
  if (!task) {
    return {
      title: '',
      notes: '',
      startTime: '',
      endTime: '',
      priority: 'MEDIUM',
      reminderAt: '',
      recurrence: 'NONE',
      projectId: '',
      tagIds: [],
    };
  }

  return {
    title: task.title,
    notes: task.notes ?? '',
    startTime: task.startTime ?? '',
    endTime: task.endTime ?? '',
    priority: task.priority,
    reminderAt: toDateTimeLocalValue(task.reminderAt),
    recurrence: task.recurrence,
    projectId: task.projectId ?? '',
    tagIds: task.tags.map((tag) => tag.id),
  };
}

type TaskFormSheetProps = {
  open: boolean;
  date: string;
  task?: Task | null;
  onClose: () => void;
};

export function TaskFormSheet({ open, date, task = null, onClose }: TaskFormSheetProps) {
  const isEditing = Boolean(task);
  const [showMore, setShowMore] = useState(() =>
    Boolean(
      task?.notes ||
        task?.endTime ||
        task?.projectId ||
        task?.tags.length ||
        task?.reminderAt ||
        (task && task.recurrence !== 'NONE')
    )
  );
  const [newProjectName, setNewProjectName] = useState('');
  const [newTagName, setNewTagName] = useState('');

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormValidator),
    defaultValues: getDefaultValues(task),
  });

  const selectedTagIds = useWatch({ control: form.control, name: 'tagIds' }) ?? [];
  const projectsQuery = useGetProjects();
  const tagsQuery = useGetTags();
  const createProjectMutation = useCreateProject();
  const createTagMutation = useCreateTag();
  const createMutation = useCreateTask(date);
  const updateMutation = useUpdateTask(date);
  const projects = projectsQuery.data ?? [];
  const tags = tagsQuery.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = isEditing ? updateMutation.error : createMutation.error;

  function toggleTag(tagId: string) {
    const current = form.getValues('tagIds') ?? [];
    form.setValue(
      'tagIds',
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
      { shouldDirty: true }
    );
  }

  async function handleCreateProject() {
    const name = newProjectName.trim();
    if (!name) return;

    const project = await createProjectMutation.mutateAsync({ name });
    form.setValue('projectId', project.id);
    setNewProjectName('');
  }

  async function handleCreateTag() {
    const name = newTagName.trim();
    if (!name) return;

    const tag = await createTagMutation.mutateAsync({ name });
    const current = form.getValues('tagIds') ?? [];
    if (!current.includes(tag.id)) {
      form.setValue('tagIds', [...current, tag.id]);
    }
    setNewTagName('');
  }

  return (
    <BottomSheet open={open} title={isEditing ? 'Edit task' : 'New task'} onClose={onClose}>
      <form
        className='space-y-3'
        onSubmit={form.handleSubmit((values) => {
          const payload = {
            title: values.title.trim(),
            notes: values.notes?.trim() || null,
            startTime: values.startTime || null,
            endTime: values.endTime || null,
            priority: values.priority,
            reminderAt: values.reminderAt
              ? (fromDateTimeLocalValue(values.reminderAt) ?? null)
              : null,
            recurrence: values.recurrence,
            projectId: values.projectId || null,
            tagIds: values.tagIds ?? [],
          };

          if (isEditing && task) {
            updateMutation.mutate(
              {
                id: task.id,
                payload: {
                  ...payload,
                  date,
                },
              },
              {
                onSuccess: () => onClose(),
              }
            );
            return;
          }

          createMutation.mutate(
            {
              title: payload.title,
              date,
              notes: payload.notes ?? undefined,
              startTime: payload.startTime ?? undefined,
              endTime: payload.endTime ?? undefined,
              priority: payload.priority,
              reminderAt: payload.reminderAt ?? undefined,
              recurrence: payload.recurrence,
              projectId: payload.projectId,
              tagIds: payload.tagIds.length ? payload.tagIds : undefined,
            },
            {
              onSuccess: () => onClose(),
            }
          );
        })}
      >
        <input
          autoFocus
          placeholder='What do you need to do?'
          className={fieldClass}
          {...form.register('title')}
        />

        {form.formState.errors.title ? (
          <p className='text-xs text-red-500'>{form.formState.errors.title.message}</p>
        ) : null}

        <div className='grid grid-cols-2 gap-3'>
          <label className='space-y-1 text-xs font-medium text-muted'>
            Start
            <input type='time' className={fieldClass} {...form.register('startTime')} />
          </label>

          <label className='space-y-1 text-xs font-medium text-muted'>
            Priority
            <select className={selectClass} {...form.register('priority')}>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type='button'
          onClick={() => setShowMore((value) => !value)}
          className='flex h-10 w-full items-center justify-between rounded-xl bg-background px-3 text-sm font-medium text-foreground'
        >
          More details
          <ChevronDown
            size={16}
            className={`text-muted transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            showMore ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className='overflow-hidden'>
            <div className='space-y-3 rounded-2xl border border-line bg-background/70 p-3'>
              <textarea
                placeholder='Notes'
                rows={3}
                className='w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none ring-primary focus:ring-2'
                {...form.register('notes')}
              />

              <label className='block space-y-1 text-xs font-medium text-muted'>
                End time
                <input type='time' className={fieldClass} {...form.register('endTime')} />
              </label>

              {form.formState.errors.endTime ? (
                <p className='text-xs text-red-500'>{form.formState.errors.endTime.message}</p>
              ) : null}

              <label className='block space-y-1 text-xs font-medium text-muted'>
                Project
                <select className={selectClass} {...form.register('projectId')}>
                  <option value=''>No project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className='flex gap-2'>
                <input
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
                  placeholder='New project'
                  className={fieldClass}
                />

                <button
                  type='button'
                  disabled={createProjectMutation.isPending || !newProjectName.trim()}
                  onClick={() => void handleCreateProject()}
                  className='h-11 shrink-0 rounded-xl border border-line px-3 text-sm font-medium disabled:opacity-50'
                >
                  Add
                </button>
              </div>

              <div className='space-y-2'>
                <p className='text-xs font-medium text-muted'>Tags</p>

                <div className='flex flex-wrap gap-2'>
                  {tags.length === 0 ? (
                    <p className='text-xs text-muted'>No tags yet.</p>
                  ) : (
                    tags.map((tag) => {
                      const selected = selectedTagIds.includes(tag.id);

                      return (
                        <button
                          key={tag.id}
                          type='button'
                          onClick={() => toggleTag(tag.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            selected
                              ? 'bg-primary text-white'
                              : 'border border-line bg-card text-muted'
                          }`}
                        >
                          #{tag.name}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className='flex gap-2'>
                  <input
                    value={newTagName}
                    onChange={(event) => setNewTagName(event.target.value)}
                    placeholder='New tag'
                    className={fieldClass}
                  />

                  <button
                    type='button'
                    disabled={createTagMutation.isPending || !newTagName.trim()}
                    onClick={() => void handleCreateTag()}
                    className='h-11 shrink-0 rounded-xl border border-line px-3 text-sm font-medium disabled:opacity-50'
                  >
                    Add
                  </button>
                </div>
              </div>

              <label className='block space-y-1 text-xs font-medium text-muted'>
                Reminder
                <input
                  type='datetime-local'
                  className={fieldClass}
                  {...form.register('reminderAt')}
                />
              </label>

              <label className='block space-y-1 text-xs font-medium text-muted'>
                Repeat
                <select className={selectClass} {...form.register('recurrence')}>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {error ? (
          <p className='text-sm text-red-500'>
            {error instanceof Error
              ? error.message
              : isEditing
                ? 'Could not update task'
                : 'Could not add task'}
          </p>
        ) : null}

        <button
          type='submit'
          disabled={isPending || (isEditing && !form.formState.isDirty)}
          className='h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-70'
        >
          {isPending ? 'Saving...' : isEditing ? 'Save changes' : 'Save task'}
        </button>
      </form>
    </BottomSheet>
  );
}
