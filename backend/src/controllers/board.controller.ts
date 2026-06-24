import { Response } from "express";
import { AuthRequest } from "../types";
import * as boardService from "../services/board.service";

export const createBoard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { title, description } = req.body;
  const board = await boardService.createBoard(
    title,
    description || "",
    req.user!.id
  );
  res.status(201).json({ board });
};

export const getBoards = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const boards = await boardService.getUserBoards(req.user!.id);
  res.json({ boards });
};

export const getBoard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const board = await boardService.getBoardById(
    req.params.id as string,
    req.user!.id
  );
  res.json({ board });
};

export const updateBoard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const board = await boardService.updateBoard(
    req.params.id as string,
    req.user!.id,
    req.body
  );
  res.json({ board });
};

export const deleteBoard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  await boardService.deleteBoard(req.params.id as string, req.user!.id);
  res.status(204).send();
};
