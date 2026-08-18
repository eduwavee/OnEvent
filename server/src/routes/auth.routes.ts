import { Router } from "express";
import { changePassword, login, me, register, updateProfile } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
router.patch("/me", requireAuth, asyncHandler(updateProfile));
router.post("/change-password", requireAuth, asyncHandler(changePassword));

export default router;
