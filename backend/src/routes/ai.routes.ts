import { Router } from "express";
import { suggestEstimate } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { aiSuggestSchema } from "../middleware/schemas";

const router = Router();

router.use(authenticate);

router.post("/suggest", validate(aiSuggestSchema), suggestEstimate);

export default router;
