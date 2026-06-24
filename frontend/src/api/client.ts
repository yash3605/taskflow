import axios from "axios";
import type {
  AuthResponse,
  Board,
  Task,
  AiSuggestion,
  TaskStatus,
  TaskPriority,
} from "../types";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => api.post<AuthResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data),

  getMe: () => api.get<{ user: { id: string; email: string } }>("/auth/me"),
};

export const boardApi = {
  getAll: () => api.get<{ boards: Board[] }>("/boards"),

  getById: (id: string) => api.get<{ board: Board }>(`/boards/${id}`),

  create: (data: { title: string; description?: string }) =>
    api.post<{ board: Board }>("/boards", data),

  update: (id: string, data: { title?: string; description?: string }) =>
    api.put<{ board: Board }>(`/boards/${id}`, data),

  delete: (id: string) => api.delete(`/boards/${id}`),
};

export const taskApi = {
  getByBoard: (boardId: string) =>
    api.get<{ tasks: Task[] }>(`/tasks/board/${boardId}`),

  create: (
    boardId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      estimatedEffort?: string;
    }
  ) => api.post<{ task: Task }>(`/tasks/board/${boardId}`, data),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string;
      estimatedEffort?: string;
    }
  ) => api.put<{ task: Task }>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/tasks/${id}`),

  move: (id: string, status: TaskStatus) =>
    api.patch<{ task: Task }>(`/tasks/${id}/move`, { status }),
};

export const aiApi = {
  suggest: (data: { title: string; description?: string }) =>
    api.post<{ suggestion: AiSuggestion }>("/ai/suggest", data),
};

export default api;
