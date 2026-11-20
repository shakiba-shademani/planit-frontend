export type GoalStatus = 'ACTIVE' | 'DONE' | 'ARCHIVED';

export type Goal = {
  id: string;
  title: string;
  notes: string | null;
  status: GoalStatus;
  targetDate: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalRequest = {
  title: string;
  notes?: string;
  status?: GoalStatus;
  targetDate?: string;
  color?: string;
};

export type UpdateGoalRequest = {
  title?: string;
  notes?: string | null;
  status?: GoalStatus;
  targetDate?: string | null;
  color?: string | null;
};
