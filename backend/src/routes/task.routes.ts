import { Router } from "express";
import {
  createTask,
  getBoardTasks,
  getTask,
  updateTask,
  deleteTask,
  moveTask,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from "../middleware/schemas";

const router = Router();

router.use(authenticate);

router.get("/board/:boardId", getBoardTasks);
router.post("/board/:boardId", validate(createTaskSchema), createTask);
router.get("/:id", getTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/move", validate(moveTaskSchema), moveTask);

export default router;
