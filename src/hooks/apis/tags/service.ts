import { axiosInstance } from '@/hooks/apis/api-config';

import type { CreateTagRequest, Tag, UpdateTagRequest } from './types';

const ENDPOINT = '/tags';

export async function getTags() {
  const { data } = await axiosInstance.get<Tag[]>(ENDPOINT);
  return data;
}

export async function createTag(payload: CreateTagRequest) {
  const { data } = await axiosInstance.post<Tag>(ENDPOINT, payload);
  return data;
}

export async function updateTag(id: string, payload: UpdateTagRequest) {
  const { data } = await axiosInstance.patch<Tag>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteTag(id: string) {
  await axiosInstance.delete(`${ENDPOINT}/${id}`);
}
