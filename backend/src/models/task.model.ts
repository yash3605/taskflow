import mongoose, { Schema, Model } from "mongoose";
import { ITask } from "../types";

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description must be at most 2000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "med", "high"],
      default: "med",
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedEffort: {
      type: String,
      trim: true,
      default: null,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
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

taskSchema.index({ board: 1, status: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });

const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);

export default Task;
