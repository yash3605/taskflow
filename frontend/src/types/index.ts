export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimatedEffort?: string;
  board: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiSuggestion {
  effort: string;
  suggestedDueDate: string;
  reasoning: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}
