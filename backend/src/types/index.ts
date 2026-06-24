import { Request } from "express";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IBoard {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type TaskPriority = "low" | "med" | "high";

export interface ITask {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedEffort?: string;
  board: Types.ObjectId;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
}

export interface AiSuggestion {
  effort: string;
  suggestedDueDate: string;
  reasoning: string;
}
