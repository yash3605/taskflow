import Board from "../models/board.model";
import Task from "../models/task.model";
import { AppError } from "../middleware/error.middleware";
import { IBoard } from "../types";

export const createBoard = async (
  title: string,
  description: string,
  ownerId: string
): Promise<IBoard> => {
  return Board.create({ title, description, owner: ownerId });
};

export const getUserBoards = async (ownerId: string): Promise<IBoard[]> => {
  return Board.find({ owner: ownerId }).sort({ createdAt: -1 });
};

export const getBoardById = async (
  boardId: string,
  ownerId: string
): Promise<IBoard> => {
  const board = await Board.findOne({ _id: boardId, owner: ownerId });
  if (!board) {
    throw new AppError(404, "Board not found");
  }
  return board;
};

export const updateBoard = async (
  boardId: string,
  ownerId: string,
  updates: { title?: string; description?: string }
): Promise<IBoard> => {
  const board = await Board.findOneAndUpdate(
    { _id: boardId, owner: ownerId },
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  );
  if (!board) {
    throw new AppError(404, "Board not found");
  }
  return board;
};

export const deleteBoard = async (
  boardId: string,
  ownerId: string
): Promise<void> => {
  const board = await Board.findOneAndDelete({ _id: boardId, owner: ownerId });
  if (!board) {
    throw new AppError(404, "Board not found");
  }
  await Task.deleteMany({ board: boardId });
};
