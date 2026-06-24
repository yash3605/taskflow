import { Response } from "express";
import { AuthRequest } from "../types";
import { getAiSuggestion } from "../services/ai.service";

export const suggestEstimate = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { title, description } = req.body;

  const suggestion = await getAiSuggestion(title, description || "");
  res.json({ suggestion });
};
