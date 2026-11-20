import { axiosInstance } from '@/hooks/apis/api-config';

import type {
  CreateHabitRequest,
  Habit,
  ToggleHabitResult,
  UpdateHabitRequest,
} from './types';

const ENDPOINT = '/habits';

export async function getHabits(date?: string) {
  const { data } = await axiosInstance.get<Habit[]>(ENDPOINT, {
    params: date ? { date } : undefined,
  });
  return data;
}

export async function createHabit(payload: CreateHabitRequest) {
  const { data } = await axiosInstance.post<Habit>(ENDPOINT, payload);
  return data;
}

export async function updateHabit(id: string, payload: UpdateHabitRequest) {
  const { data } = await axiosInstance.patch<Habit>(`${ENDPOINT}/${id}`, payload);
  return data;
}

export async function deleteHabit(id: string) {
  await axiosInstance.delete(`${ENDPOINT}/${id}`);
}

export async function toggleHabit(id: string, date: string) {
  const { data } = await axiosInstance.post<ToggleHabitResult>(
    `${ENDPOINT}/${id}/toggle`,
    { date }
  );
  return data;
}
