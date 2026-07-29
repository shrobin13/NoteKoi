import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { requireScope } from "../../middlewares/requireScope.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import { AssignCRSchema, DemoteCRSchema } from "./cr.schema.js";
import * as ctrl from "./cr.controller.js";

const router: Router = Router();

// GET /api/cr/:classroomUnitId — list active CRs for a unit (authenticated)
router.get(
  "/:classroomUnitId",
  authenticate(),
  ctrl.listCRsForUnit,
);

// POST /api/cr/assign — Sub Admin (own college) or Owner Admin (R-017, INV-003)
router.post(
  "/assign",
  authenticate(),
  requireRole(Role.SUB_ADMIN, Role.OWNER_ADMIN),
  requireScope("college"),
  validateWithDetails(AssignCRSchema),
  ctrl.assignCR,
);

// DELETE /api/cr/demote — Sub Admin (own college) or Owner Admin (R-017)
router.delete(
  "/demote",
  authenticate(),
  requireRole(Role.SUB_ADMIN, Role.OWNER_ADMIN),
  requireScope("college"),
  validateWithDetails(DemoteCRSchema),
  ctrl.demoteCR,
);

export default router;
