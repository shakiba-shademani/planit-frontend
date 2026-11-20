'use client';

import { useState } from 'react';

import { ArrowLeft, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { HabitFormSheet } from '@/app/(main)/habits/_components/habit-form-sheet';
import { ROUTES } from '@/constants/routes';
import {
  useDeleteHabit,
  useGetHabits,
  useToggleHabit,
} from '@/hooks/apis/habits';
import type { Habit } from '@/hooks/apis/habits/types';
import { todayISO } from '@/utils/date';

export default function HabitsPage() {
  const today = todayISO();
  const habitsQuery = useGetHabits(today);
  const deleteMutation = useDeleteHabit();
  const toggleMutation = useToggleHabit();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const habits = habitsQuery.data ?? [];
  const activeHabits = habits.filter((habit) => habit.active);
  const doneCount = activeHabits.filter((habit) => habit.completedToday).length;

  function openCreateSheet() {
    setEditingHabit(null);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function openEditSheet(habit: Habit) {
    setEditingHabit(habit);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingHabit(null);
  }

  return (
    <>
      <header className='mb-5'>
        <Link
          href={ROUTES.homePage}
          className='mb-3 inline-flex items-center gap-1 text-sm text-muted'
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className='flex items-start justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold'>Habits</h1>
            <p className='mt-1 text-sm text-muted'>
              {activeHabits.length === 0
                ? 'Repeating check-ins for your routines.'
                : `${doneCount}/${activeHabits.length} done today`}
            </p>
          </div>

          <button
            type='button'
            onClick={openCreateSheet}
            className='inline-flex h-10 items-center gap-1 rounded-xl bg-primary px-3 text-sm font-semibold text-white'
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </header>

      {habitsQuery.isLoading ? (
        <p className='mt-6 text-center text-sm text-muted'>Loading habits...</p>
      ) : habitsQuery.isError ? (
        <p className='mt-6 text-center text-sm text-red-500'>
          {habitsQuery.error instanceof Error
            ? habitsQuery.error.message
            : 'Could not load habits'}
        </p>
      ) : habits.length === 0 ? (
        <div className='mt-8 rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
          <p className='font-medium'>No habits yet</p>
          <p className='mt-1 text-sm text-muted'>Add a routine you want to keep.</p>
          <button
            type='button'
            onClick={openCreateSheet}
            className='mt-4 inline-flex h-10 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white'
          >
            <Plus size={16} />
            New habit
          </button>
        </div>
      ) : (
        <ul className='space-y-2'>
          {habits.map((habit) => (
            <li
              key={habit.id}
              className={`rounded-2xl border border-line bg-card px-3 py-3 shadow-sm ${
                habit.active ? '' : 'opacity-60'
              }`}
            >
              <div className='flex items-start gap-3'>
                <button
                  type='button'
                  disabled={!habit.active || toggleMutation.isPending}
                  aria-label={
                    habit.completedToday ? 'Mark habit incomplete' : 'Mark habit complete'
                  }
                  onClick={() => toggleMutation.mutate({ id: habit.id, date: today })}
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                    habit.completedToday
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-background text-transparent'
                  }`}
                >
                  <Check size={14} />
                </button>

                <div className='min-w-0 flex-1'>
                  <p className={`font-medium ${habit.completedToday ? 'text-muted line-through' : ''}`}>
                    {habit.title}
                  </p>
                  <p className='mt-1 text-xs text-muted'>
                    {habit.frequency === 'DAILY' ? 'Daily' : 'Weekly'}
                    {habit.active ? '' : ' · Paused'}
                  </p>
                </div>

                <div className='flex shrink-0 gap-1'>
                  <button
                    type='button'
                    aria-label='Edit habit'
                    onClick={() => openEditSheet(habit)}
                    className='rounded-lg p-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-800'
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type='button'
                    aria-label='Delete habit'
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(habit.id)}
                    className='rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <HabitFormSheet
        key={sheetKey}
        open={sheetOpen}
        habit={editingHabit}
        onClose={closeSheet}
      />
    </>
  );
}
