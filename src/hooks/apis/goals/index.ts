'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createGoal, deleteGoal, getGoals, updateGoal } from './service';
import type { CreateGoalRequest, Goal, UpdateGoalRequest } from './types';

export const goalKeys = {
  all: ['goals'] as const,
  list: ['goals', 'list'] as const,
};

export function useGetGoals() {
  return useQuery<Goal[], Error>({
    queryKey: goalKeys.list,
    queryFn: getGoals,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGoalRequest) => createGoal(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalRequest }) =>
      updateGoal(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
