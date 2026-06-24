import mongoose, { Schema, Model } from "mongoose";
import { IBoard } from "../types";

const boardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, "Board title is required"],
      trim: true,
      maxlength: [100, "Title must be at most 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must be at most 500 characters"],
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

boardSchema.index({ owner: 1, createdAt: -1 });

const Board: Model<IBoard> = mongoose.model<IBoard>("Board", boardSchema);

export default Board;
