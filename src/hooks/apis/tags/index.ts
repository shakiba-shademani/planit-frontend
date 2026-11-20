'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTag, deleteTag, getTags, updateTag } from './service';
import type { CreateTagRequest, Tag, UpdateTagRequest } from './types';

export const tagKeys = {
  all: ['tags'] as const,
  list: ['tags', 'list'] as const,
};

export function useGetTags() {
  return useQuery<Tag[], Error>({
    queryKey: tagKeys.list,
    queryFn: getTags,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagRequest) => createTag(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagRequest }) =>
      updateTag(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
    },
  });
}
