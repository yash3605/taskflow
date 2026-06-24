import { Router } from "express";
import {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} from "../controllers/board.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createBoardSchema, updateBoardSchema } from "../middleware/schemas";

const router = Router();

router.use(authenticate);

router.post("/", validate(createBoardSchema), createBoard);
router.get("/", getBoards);
router.get("/:id", getBoard);
router.put("/:id", validate(updateBoardSchema), updateBoard);
router.delete("/:id", deleteBoard);

export default router;
