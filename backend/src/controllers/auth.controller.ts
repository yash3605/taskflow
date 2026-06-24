import { Response } from "express";
import { AuthRequest } from "../types";
import { createUser, findUserByEmail } from "../services/auth.service";
import { generateToken } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";

export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, email, password } = req.body;

  const user = await createUser(name, email, password);
  const token = generateToken({ id: user._id.toString(), email: user.email });

  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email },
    token,
  });
};

export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateToken({ id: user._id.toString(), email: user.email });

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    token,
  });
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const user = req.user;
  res.json({ user });
};
