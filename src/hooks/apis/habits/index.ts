'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createHabit,
  deleteHabit,
  getHabits,
  toggleHabit,
  updateHabit,
} from './service';
import type { CreateHabitRequest, Habit, UpdateHabitRequest } from './types';

export const habitKeys = {
  all: ['habits'] as const,
  list: (date: string) => ['habits', 'list', date] as const,
};

export function useGetHabits(date: string) {
  return useQuery<Habit[], Error>({
    queryKey: habitKeys.list(date),
    queryFn: () => getHabits(date),
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateHabitRequest) => createHabit(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHabitRequest }) =>
      updateHabit(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHabit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}

export function useToggleHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) => toggleHabit(id, date),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: habitKeys.all });
    },
  });
}
