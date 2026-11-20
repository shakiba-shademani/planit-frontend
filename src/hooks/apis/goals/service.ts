import { axiosInstance } from '@/hooks/apis/api-config';

import type { CreateGoalRequest, Goal, UpdateGoalRequest } from './types';

const ENDPOINT = '/goals';

export async function getGoals() {
  const { data } = await axiosInstance.get<Goal[]>(ENDPOINT);
  return data;
}

export async function createGoal(payload: CreateGoalRequest) {
  const { data } = await axiosInstance.post<Goal>(ENDPOINT, payload);
  return data;
}

export async function updateGoal(id: string, payload: UpdateGoalRequest) {
  const { data } = await axiosInstance.patch<Goal>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteGoal(id: string) {
  await axiosInstance.delete(`${ENDPOINT}/${id}`);
}
