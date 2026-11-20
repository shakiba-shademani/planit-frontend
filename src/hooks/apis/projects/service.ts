import { axiosInstance } from '@/hooks/apis/api-config';

import type { CreateProjectRequest, Project, UpdateProjectRequest } from './types';

const ENDPOINT = '/projects';

export async function getProjects() {
  const { data } = await axiosInstance.get<Project[]>(ENDPOINT);
  return data;
}

export async function createProject(payload: CreateProjectRequest) {
  const { data } = await axiosInstance.post<Project>(ENDPOINT, payload);
  return data;
}

export async function updateProject(id: string, payload: UpdateProjectRequest) {
  const { data } = await axiosInstance.patch<Project>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteProject(id: string) {
  await axiosInstance.delete(`${ENDPOINT}/${id}`);
}
