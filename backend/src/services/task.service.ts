import Task from "../models/task.model";
import Board from "../models/board.model";
import { AppError } from "../middleware/error.middleware";
import { ITask, TaskStatus, TaskPriority } from "../types";

export const createTask = async (
  boardId: string,
  ownerId: string,
  taskData: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date | undefined;
    estimatedEffort?: string | undefined;
  }
): Promise<ITask> => {
  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) {
    throw new AppError(404, "Board not found");
  }

  return Task.create({
    ...taskData,
    board: boardId,
    owner: ownerId,
  });
};

export const getBoardTasks = async (
  boardId: string,
  ownerId: string
): Promise<ITask[]> => {
  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) {
    throw new AppError(404, "Board not found");
  }

  return Task.find({ board: boardId, owner: ownerId }).sort({ createdAt: -1 });
};

export const getTaskById = async (
  taskId: string,
  ownerId: string
): Promise<ITask> => {
  const task = await Task.findOne({ _id: taskId, owner: ownerId });
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return task;
};

export const updateTask = async (
  taskId: string,
  ownerId: string,
  updates: Partial<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date | undefined;
    estimatedEffort: string | undefined;
  }>
): Promise<ITask> => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, owner: ownerId },
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  );
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return task;
};

export const deleteTask = async (
  taskId: string,
  ownerId: string
): Promise<void> => {
  const task = await Task.findOneAndDelete({ _id: taskId, owner: ownerId });
  if (!task) {
    throw new AppError(404, "Task not found");
  }
};

export const moveTask = async (
  taskId: string,
  ownerId: string,
  status: TaskStatus
): Promise<ITask> => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, owner: ownerId },
    { $set: { status } },
    { returnDocument: "after", runValidators: true }
  );
  if (!task) {
    throw new AppError(404, "Task not found");
  }
  return task;
};
