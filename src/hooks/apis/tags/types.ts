export type Tag = {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTagRequest = {
  name: string;
  color?: string;
};

export type UpdateTagRequest = {
  name?: string;
  color?: string | null;
};
