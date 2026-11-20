export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecurrenceFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type TaskProjectSummary = {
  id: string;
  name: string;
  color: string | null;
};

export type TaskTagSummary = {
  id: string;
  name: string;
  color: string | null;
};

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  priority: TaskPriority;
  reminderAt: string | null;
  recurrence: RecurrenceFrequency;
  done: boolean;
  projectId: string | null;
  parentId: string | null;
  project: TaskProjectSummary | null;
  tags: TaskTagSummary[];
  subtasks: Task[];
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskRequest = {
  title: string;
  date: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  priority?: TaskPriority;
  reminderAt?: string;
  recurrence?: RecurrenceFrequency;
  projectId?: string | null;
  parentId?: string;
  tagIds?: string[];
};

export type UpdateTaskRequest = {
  title?: string;
  date?: string;
  notes?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  priority?: TaskPriority;
  reminderAt?: string | null;
  recurrence?: RecurrenceFrequency;
  projectId?: string | null;
  tagIds?: string[];
  done?: boolean;
};
