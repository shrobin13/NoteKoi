import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import { RequestVerificationSchema } from "./verification.schema.js";
import * as ctrl from "./verification.controller.js";
const router = Router();
// POST /api/verification/request — Student requests verification (R-028)
router.post("/request", authenticate(), // any authenticated user
validateWithDetails(RequestVerificationSchema), ctrl.requestVerification);
// GET /api/verification/pending — CR, Sub Admin, Owner Admin see their scoped pending list
router.get("/pending", authenticate(), requireRole(Role.CR, Role.SUB_ADMIN, Role.OWNER_ADMIN), ctrl.getPendingRequests);
// POST /api/verification/approve/:requestId — R-029 fallback order enforced in service
router.post("/approve/:requestId", authenticate(), requireRole(Role.CR, Role.SUB_ADMIN, Role.OWNER_ADMIN), ctrl.approveVerification);
export default router;
