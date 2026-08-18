import { Router } from "express";
import { getMyOrganizationEventStats, getOrganization } from "../controllers/organizations.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Rutas fijas antes de "/:id" para que "me" no se interprete como un id de organización.
router.get("/me/events-stats", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(getMyOrganizationEventStats));
router.get("/:id", asyncHandler(getOrganization));

export default router;
