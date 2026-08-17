import { Router } from "express";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from "../controllers/events.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { optionalAuth, requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import registrationsRouter from "./registrations.routes";
import attendanceRouter from "./attendance.routes";

const router = Router();

// Ruta publica, pero optionalAuth deja req.user disponible para ?mine=true
router.get("/", optionalAuth, asyncHandler(listEvents));
router.get("/:id", asyncHandler(getEvent));
router.post("/", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(createEvent));
router.put("/:id", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(updateEvent));
router.delete("/:id", requireAuth, requireRole("ORGANIZER", "ADMIN"), asyncHandler(deleteEvent));

// Sub-rutas anidadas bajo /api/events/:eventId/...
router.use("/:eventId/registrations", registrationsRouter);
router.use("/:eventId/attendance", attendanceRouter);

export default router;
