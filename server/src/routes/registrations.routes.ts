import { Router } from "express";
import {
  cancelMyRegistration,
  getMyTicket,
  listRegistrations,
  registerToEvent,
} from "../controllers/registrations.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

// mergeParams para poder leer :eventId, ya que se monta anidado bajo /api/events/:eventId/registrations
const router = Router({ mergeParams: true });

router.post("/", requireAuth, asyncHandler(registerToEvent));
router.delete("/me", requireAuth, asyncHandler(cancelMyRegistration));
router.get("/me/ticket", requireAuth, asyncHandler(getMyTicket));
router.get("/", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(listRegistrations));

export default router;
