'use client';

import { Check, ChevronRight, Target } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '@/constants/routes';
import { useGetGoals } from '@/hooks/apis/goals';
import { useGetHabits, useToggleHabit } from '@/hooks/apis/habits';
import { todayISO } from '@/utils/date';

export function GoalsHabitsOverview() {
  const today = todayISO();
  const goalsQuery = useGetGoals();
  const habitsQuery = useGetHabits(today);
  const toggleMutation = useToggleHabit();

  const goals = goalsQuery.data ?? [];
  const habits = habitsQuery.data ?? [];
  const activeGoals = goals.filter((goal) => goal.status === 'ACTIVE').slice(0, 3);
  const activeHabits = habits.filter((habit) => habit.active);
  const previewHabits = activeHabits.slice(0, 3);
  const habitsDone = activeHabits.filter((habit) => habit.completedToday).length;

  return (
    <section className='mt-5 space-y-3'>
      <div className='grid grid-cols-2 gap-2'>
        <Link
          href={ROUTES.goals}
          className='rounded-2xl border border-line bg-card px-3 py-3 transition hover:border-primary/40'
        >
          <div className='flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-1.5 text-sm font-semibold'>
              <Target size={16} className='text-primary' />
              Goals
            </span>
            <ChevronRight size={16} className='text-muted' />
          </div>
          <p className='mt-2 text-xs text-muted'>
            {goalsQuery.isLoading
              ? 'Loading...'
              : `${goals.filter((goal) => goal.status === 'ACTIVE').length} active`}
          </p>
        </Link>

        <Link
          href={ROUTES.habits}
          className='rounded-2xl border border-line bg-card px-3 py-3 transition hover:border-primary/40'
        >
          <div className='flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-1.5 text-sm font-semibold'>
              <Check size={16} className='text-primary' />
              Habits
            </span>
            <ChevronRight size={16} className='text-muted' />
          </div>
          <p className='mt-2 text-xs text-muted'>
            {habitsQuery.isLoading
              ? 'Loading...'
              : activeHabits.length === 0
                ? 'None yet'
                : `${habitsDone}/${activeHabits.length} today`}
          </p>
        </Link>
      </div>

      {activeGoals.length > 0 ? (
        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <div className='mb-2 flex items-center justify-between'>
            <p className='text-xs font-medium uppercase tracking-wide text-muted'>
              Active goals
            </p>
            <Link href={ROUTES.goals} className='text-xs font-medium text-primary'>
              All
            </Link>
          </div>
          <ul className='space-y-1.5'>
            {activeGoals.map((goal) => (
              <li key={goal.id} className='truncate text-sm'>
                {goal.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {previewHabits.length > 0 ? (
        <div className='rounded-2xl border border-line bg-card px-3 py-3'>
          <div className='mb-2 flex items-center justify-between'>
            <p className='text-xs font-medium uppercase tracking-wide text-muted'>
              Today&apos;s habits
            </p>
            <Link href={ROUTES.habits} className='text-xs font-medium text-primary'>
              All
            </Link>
          </div>
          <ul className='space-y-2'>
            {previewHabits.map((habit) => (
              <li key={habit.id} className='flex items-center gap-2'>
                <button
                  type='button'
                  disabled={toggleMutation.isPending}
                  aria-label={
                    habit.completedToday ? 'Mark habit incomplete' : 'Mark habit complete'
                  }
                  onClick={() => toggleMutation.mutate({ id: habit.id, date: today })}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    habit.completedToday
                      ? 'border-primary bg-primary text-white'
                      : 'border-line bg-background text-transparent'
                  }`}
                >
                  <Check size={12} />
                </button>
                <span
                  className={`truncate text-sm ${
                    habit.completedToday ? 'text-muted line-through' : ''
                  }`}
                >
                  {habit.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
