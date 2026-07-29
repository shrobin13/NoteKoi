import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import { AssignSubAdminSchema, TransferOwnershipSchema, } from "./admin.schema.js";
import * as ctrl from "./admin.controller.js";
const router = Router();
// All admin routes require Owner Admin role
router.use(authenticate(), requireRole(Role.OWNER_ADMIN));
// GET /api/admin/sub-admins — list all active sub admins
router.get("/sub-admins", ctrl.listSubAdmins);
// POST /api/admin/sub-admins — assign sub admin (R-003, INV-002)
router.post("/sub-admins", validateWithDetails(AssignSubAdminSchema), ctrl.assignSubAdmin);
// DELETE /api/admin/sub-admins/:userId — demote sub admin (R-003)
router.delete("/sub-admins/:userId", ctrl.demoteSubAdmin);
// POST /api/admin/transfer-ownership — atomic ownership transfer (R-004, INV-001)
router.post("/transfer-ownership", validateWithDetails(TransferOwnershipSchema), ctrl.transferOwnership);
// GET /api/admin/stats — platform-wide stats (R-006, INV-009)
router.get("/stats", ctrl.getPlatformStats);
export default router;
