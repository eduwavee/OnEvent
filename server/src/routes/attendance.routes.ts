import { Router } from "express";
import { checkIn, getAttendanceStats } from "../controllers/attendance.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

// mergeParams para leer :eventId, ya que se monta anidado bajo /api/events/:eventId/attendance
const router = Router({ mergeParams: true });

router.post("/check-in", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(checkIn));
router.get("/", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(getAttendanceStats));

export default router;
