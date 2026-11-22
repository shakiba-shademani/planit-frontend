'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  goalFormValidator,
  type GoalFormValues,
} from '@/app/(main)/goals/_validators/goal-form-validator';
import { AppSelect } from '@/components/app-select';
import { BottomSheet } from '@/components/bottom-sheet';
import { GOAL_STATUSES } from '@/constants/goals-habits';
import { useCreateGoal, useUpdateGoal } from '@/hooks/apis/goals';
import type { Goal } from '@/hooks/apis/goals/types';

const fieldClass =
  'h-11 w-full min-w-0 rounded-xl border border-line bg-background px-3 text-base outline-none ring-primary focus:ring-2';

function getDefaultValues(goal?: Goal | null): GoalFormValues {
  if (!goal) {
    return {
      title: '',
      notes: '',
      status: 'ACTIVE',
      targetDate: '',
    };
  }

  return {
    title: goal.title,
    notes: goal.notes ?? '',
    status: goal.status,
    targetDate: goal.targetDate ?? '',
  };
}

type GoalFormSheetProps = {
  open: boolean;
  goal?: Goal | null;
  onClose: () => void;
};

export function GoalFormSheet({ open, goal = null, onClose }: GoalFormSheetProps) {
  const isEditing = Boolean(goal);
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormValidator),
    defaultValues: getDefaultValues(goal),
  });

  const busy = createMutation.isPending || updateMutation.isPending;
  const isDirty = form.formState.isDirty;

  async function onSubmit(values: GoalFormValues) {
    const payload = {
      title: values.title.trim(),
      notes: values.notes?.trim() || undefined,
      status: values.status,
      targetDate: values.targetDate || undefined,
    };

    if (isEditing && goal) {
      await updateMutation.mutateAsync({
        id: goal.id,
        payload: {
          title: payload.title,
          notes: values.notes?.trim() ? values.notes.trim() : null,
          status: payload.status,
          targetDate: values.targetDate ? values.targetDate : null,
        },
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onClose();
  }

  return (
    <BottomSheet open={open} title={isEditing ? 'Edit goal' : 'New goal'} onClose={onClose}>
      <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='goal-title' className='mb-1 block text-sm font-medium'>
            Title
          </label>
          <input
            id='goal-title'
            className={fieldClass}
            {...form.register('title')}
            disabled={busy}
          />
          {form.formState.errors.title ? (
            <p className='mt-1 text-xs text-red-500'>{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <span className='mb-1 block text-sm font-medium'>Status</span>
          <Controller
            control={form.control}
            name='status'
            render={({ field }) => (
              <AppSelect
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={GOAL_STATUSES}
                disabled={busy}
              />
            )}
          />
        </div>

        <div>
          <label htmlFor='goal-target' className='mb-1 block text-sm font-medium'>
            Target date
          </label>
          <input
            id='goal-target'
            type='date'
            className={fieldClass}
            {...form.register('targetDate')}
            disabled={busy}
          />
        </div>

        <div>
          <label htmlFor='goal-notes' className='mb-1 block text-sm font-medium'>
            Notes
          </label>
          <textarea
            id='goal-notes'
            rows={3}
            className='w-full rounded-xl border border-line bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2'
            {...form.register('notes')}
            disabled={busy}
          />
        </div>

        <button
          type='submit'
          disabled={busy || (isEditing && !isDirty)}
          className='h-11 w-full rounded-xl bg-primary text-sm font-semibold text-white disabled:opacity-50'
        >
          {busy ? 'Saving...' : isEditing ? 'Save' : 'Create'}
        </button>
      </form>
    </BottomSheet>
  );
}
