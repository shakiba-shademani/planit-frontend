'use client';

import { useState } from 'react';

import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { GoalFormSheet } from '@/app/(main)/goals/_components/goal-form-sheet';
import { StickyPageHeader } from '@/components/layout/sticky-page-header';
import { GOAL_STATUS_STYLES } from '@/constants/goals-habits';
import { ROUTES } from '@/constants/routes';
import { useDeleteGoal, useGetGoals } from '@/hooks/apis/goals';
import type { Goal } from '@/hooks/apis/goals/types';
import { formatLongDate } from '@/utils/date';

export default function GoalsPage() {
  const goalsQuery = useGetGoals();
  const deleteMutation = useDeleteGoal();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const goals = goalsQuery.data ?? [];
  const activeCount = goals.filter((goal) => goal.status === 'ACTIVE').length;

  function openCreateSheet() {
    setEditingGoal(null);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function openEditSheet(goal: Goal) {
    setEditingGoal(goal);
    setSheetKey((value) => value + 1);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingGoal(null);
  }

  return (
    <>
      <StickyPageHeader>
        <Link
          href={ROUTES.homePage}
          className='mb-3 inline-flex items-center gap-1 text-sm text-muted'
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className='flex items-start justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold'>Goals</h1>
            <p className='mt-1 text-sm text-muted'>
              {activeCount === 0
                ? 'Longer-term outcomes you are working toward.'
                : `${activeCount} active`}
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
      </StickyPageHeader>

      {goalsQuery.isLoading ? (
        <p className='mt-6 text-center text-sm text-muted'>Loading goals...</p>
      ) : goalsQuery.isError ? (
        <p className='mt-6 text-center text-sm text-red-500'>
          {goalsQuery.error instanceof Error
            ? goalsQuery.error.message
            : 'Could not load goals'}
        </p>
      ) : goals.length === 0 ? (
        <div className='mt-8 rounded-2xl border border-dashed border-line px-4 py-10 text-center'>
          <p className='font-medium'>No goals yet</p>
          <p className='mt-1 text-sm text-muted'>Add one outcome you want to reach.</p>
          <button
            type='button'
            onClick={openCreateSheet}
            className='mt-4 inline-flex h-10 items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white'
          >
            <Plus size={16} />
            New goal
          </button>
        </div>
      ) : (
        <ul className='space-y-2'>
          {goals.map((goal) => (
            <li
              key={goal.id}
              className='rounded-2xl border border-line bg-card px-3 py-3 shadow-sm'
            >
              <div className='flex items-start gap-3'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='font-medium'>{goal.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${GOAL_STATUS_STYLES[goal.status]}`}
                    >
                      {goal.status.toLowerCase()}
                    </span>
                  </div>

                  {goal.targetDate ? (
                    <p className='mt-1 text-xs text-muted'>
                      Target {formatLongDate(goal.targetDate)}
                    </p>
                  ) : null}

                  {goal.notes ? (
                    <p className='mt-2 line-clamp-2 text-sm text-muted'>{goal.notes}</p>
                  ) : null}
                </div>

                <div className='flex shrink-0 gap-1'>
                  <button
                    type='button'
                    aria-label='Edit goal'
                    onClick={() => openEditSheet(goal)}
                    className='rounded-lg p-2 text-muted hover:bg-slate-100 dark:hover:bg-slate-800'
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type='button'
                    aria-label='Delete goal'
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(goal.id)}
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

      <GoalFormSheet
        key={sheetKey}
        open={sheetOpen}
        goal={editingGoal}
        onClose={closeSheet}
      />
    </>
  );
}
