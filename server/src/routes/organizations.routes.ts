import { Router } from "express";
import { getOrganization } from "../controllers/organizations.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:id", asyncHandler(getOrganization));

export default router;
