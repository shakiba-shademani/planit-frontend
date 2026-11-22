'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import {
  habitFormValidator,
  type HabitFormValues,
} from '@/app/(main)/habits/_validators/habit-form-validator';
import { AppSelect } from '@/components/app-select';
import { BottomSheet } from '@/components/bottom-sheet';
import { HABIT_FREQUENCIES } from '@/constants/goals-habits';
import { useCreateHabit, useUpdateHabit } from '@/hooks/apis/habits';
import type { Habit } from '@/hooks/apis/habits/types';

const fieldClass =
  'h-11 w-full min-w-0 rounded-xl border border-line bg-background px-3 text-base outline-none ring-primary focus:ring-2';

function getDefaultValues(habit?: Habit | null): HabitFormValues {
  if (!habit) {
    return {
      title: '',
      frequency: 'DAILY',
      active: true,
    };
  }

  return {
    title: habit.title,
    frequency: habit.frequency,
    active: habit.active,
  };
}

type HabitFormSheetProps = {
  open: boolean;
  habit?: Habit | null;
  onClose: () => void;
};

export function HabitFormSheet({ open, habit = null, onClose }: HabitFormSheetProps) {
  const isEditing = Boolean(habit);
  const createMutation = useCreateHabit();
  const updateMutation = useUpdateHabit();
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormValidator),
    defaultValues: getDefaultValues(habit),
  });

  const busy = createMutation.isPending || updateMutation.isPending;
  const isDirty = form.formState.isDirty;

  async function onSubmit(values: HabitFormValues) {
    if (isEditing && habit) {
      await updateMutation.mutateAsync({
        id: habit.id,
        payload: {
          title: values.title.trim(),
          frequency: values.frequency,
          active: values.active,
        },
      });
    } else {
      await createMutation.mutateAsync({
        title: values.title.trim(),
        frequency: values.frequency,
      });
    }

    onClose();
  }

  return (
    <BottomSheet open={open} title={isEditing ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label htmlFor='habit-title' className='mb-1 block text-sm font-medium'>
            Title
          </label>
          <input
            id='habit-title'
            className={fieldClass}
            {...form.register('title')}
            disabled={busy}
          />
          {form.formState.errors.title ? (
            <p className='mt-1 text-xs text-red-500'>{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <span className='mb-1 block text-sm font-medium'>Frequency</span>
          <Controller
            control={form.control}
            name='frequency'
            render={({ field }) => (
              <AppSelect
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={HABIT_FREQUENCIES}
                disabled={busy}
              />
            )}
          />
        </div>

        {isEditing ? (
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' {...form.register('active')} disabled={busy} />
            Active
          </label>
        ) : null}

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
