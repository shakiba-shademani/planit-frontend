export type Project = {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  name: string;
  color?: string;
};

export type UpdateProjectRequest = {
  name?: string;
  color?: string | null;
};
