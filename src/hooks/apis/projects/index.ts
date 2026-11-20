'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createProject, deleteProject, getProjects, updateProject } from './service';
import type { CreateProjectRequest, Project, UpdateProjectRequest } from './types';

export const projectKeys = {
  all: ['projects'] as const,
  list: ['projects', 'list'] as const,
};

export function useGetProjects() {
  return useQuery<Project[], Error>({
    queryKey: projectKeys.list,
    queryFn: getProjects,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectRequest }) =>
      updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
