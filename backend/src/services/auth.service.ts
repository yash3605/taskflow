import bcrypt from "bcrypt";
import User from "../models/user.model";
import { AppError } from "../middleware/error.middleware";
import { IUser } from "../types";

export const createUser = async (
  name: string,
  email: string,
  password: string
): Promise<Pick<IUser, "_id" | "name" | "email">> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });
  return { _id: user._id, name: user.name, email: user.email };
};

export const findUserByEmail = async (
  email: string
): Promise<IUser | null> => {
  return User.findOne({ email }).select("+password");
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id);
};
