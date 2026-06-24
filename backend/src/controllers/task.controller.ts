import { Response } from "express";
import { AuthRequest } from "../types";
import * as taskService from "../services/task.service";

export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const boardId = req.params.boardId as string;
  const { title, description, status, priority, dueDate, estimatedEffort } =
    req.body;

  const task = await taskService.createTask(boardId, req.user!.id, {
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    estimatedEffort,
  });

  res.status(201).json({ task });
};

export const getBoardTasks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const tasks = await taskService.getBoardTasks(
    req.params.boardId as string,
    req.user!.id
  );
  res.json({ tasks });
};

export const getTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const task = await taskService.getTaskById(
    req.params.id as string,
    req.user!.id
  );
  res.json({ task });
};

export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { dueDate, ...rest } = req.body;
  const updates = {
    ...rest,
    ...(dueDate !== undefined && {
      dueDate: dueDate ? new Date(dueDate) : undefined,
    }),
  };

  const task = await taskService.updateTask(
    req.params.id as string,
    req.user!.id,
    updates
  );
  res.json({ task });
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  await taskService.deleteTask(req.params.id as string, req.user!.id);
  res.status(204).send();
};

export const moveTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const task = await taskService.moveTask(
    req.params.id as string,
    req.user!.id,
    req.body.status
  );
  res.json({ task });
};
