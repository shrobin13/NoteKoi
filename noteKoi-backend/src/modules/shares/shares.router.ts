import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import { CreateShareSchema, ShareQuerySchema } from "./shares.schema.js";
import * as ctrl from "./shares.controller.js";

const router: Router = Router();

// GET /api/shares — Get personal shares for calling user
router.get(
  "/",
  authenticate({ requireVerified: true }),
  validateWithDetails(ShareQuerySchema, "query"),
  ctrl.getMyShares,
);

// POST /api/shares — Send personal share (CR only)
router.post(
  "/",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  validateWithDetails(CreateShareSchema),
  ctrl.createShare,
);

export default router;
