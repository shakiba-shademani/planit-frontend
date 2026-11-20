export type HabitFrequency = 'DAILY' | 'WEEKLY';

export type Habit = {
  id: string;
  title: string;
  frequency: HabitFrequency;
  active: boolean;
  color: string | null;
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateHabitRequest = {
  title: string;
  frequency?: HabitFrequency;
  color?: string;
};

export type UpdateHabitRequest = {
  title?: string;
  frequency?: HabitFrequency;
  active?: boolean;
  color?: string | null;
};

export type ToggleHabitResult = {
  completed: boolean;
  date: string;
};
