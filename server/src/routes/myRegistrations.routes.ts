import { Router } from "express";
import { listMyRegistrations } from "../controllers/registrations.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";

// Se monta directamente en /api/registrations (no anidado bajo un evento).
const router = Router();

router.get("/me", requireAuth, asyncHandler(listMyRegistrations));

export default router;
