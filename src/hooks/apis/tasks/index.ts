'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTask,
  deleteTask,
  getTasks,
  getTasksByRange,
  updateTask,
} from './service';
import type { CreateTaskRequest, Task, UpdateTaskRequest } from './types';

export const taskKeys = {
  all: ['tasks'] as const,
  list: (date: string) => ['tasks', 'list', date] as const,
  range: (from: string, to: string) => ['tasks', 'range', from, to] as const,
};

export function useGetTasks(date: string) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.list(date),
    queryFn: () => getTasks(date),
  });
}

export function useGetTasksRange(from: string, to: string) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.range(from, to),
    queryFn: () => getTasksByRange(from, to),
    enabled: Boolean(from && to && from <= to),
  });
}

function useInvalidateAllTasks() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };
}

/** `date` kept for call-site compatibility with Plan; invalidates all task queries. */
export function useCreateTask(date: string) {
  void date;
  const invalidateAllTasks = useInvalidateAllTasks();

  return useMutation({
    mutationFn: (payload: CreateTaskRequest) => createTask(payload),
    onSuccess: invalidateAllTasks,
  });
}

/** `date` kept for call-site compatibility with Plan; invalidates all task queries. */
export function useUpdateTask(date: string) {
  void date;
  const invalidateAllTasks = useInvalidateAllTasks();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskRequest }) =>
      updateTask(id, payload),
    onSuccess: invalidateAllTasks,
  });
}

/** `date` kept for call-site compatibility with Plan; invalidates all task queries. */
export function useDeleteTask(date: string) {
  void date;
  const invalidateAllTasks = useInvalidateAllTasks();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: invalidateAllTasks,
  });
}
