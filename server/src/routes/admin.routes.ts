import { Router } from "express";
import { deleteUser, getGlobalStats, listUsers, updateUserRole } from "../controllers/admin.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

// Todas las rutas de administración requieren estar autenticado con rol ADMIN.
router.use(requireAuth, requireRole("ADMIN"));

router.get("/users", asyncHandler(listUsers));
router.patch("/users/:id/role", asyncHandler(updateUserRole));
router.delete("/users/:id", asyncHandler(deleteUser));
router.get("/stats", asyncHandler(getGlobalStats));

export default router;
