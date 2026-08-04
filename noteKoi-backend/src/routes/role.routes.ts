import { Router, type Router as ExpressRouter, type Request, type Response, type NextFunction } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { appointCrCoCrHandler, appointSubAdminHandler, revokeCrCoCrHandler, revokeSubAdminHandler } from "../controllers/subAdmin.controller.js";
import { validate } from "../middlewares/validate.js";
import { subAdminAssignmentSchema, crCoCrAssignmentSchema } from "../validators/roleAssignment.validator.js";
import { ok } from "../helpers/response.js";
import type { AuthenticatedRequest } from "../middlewares/authenticate.js";
import { findAllActiveSubAdminAssignments } from "../repositories/subAdminAssignment.repository.js";
import { findActiveCrCoCrAssignmentsByCollege } from "../repositories/crCoCrAssignment.repository.js";
import { findActiveSubAdminAssignmentByUser } from "../repositories/subAdminAssignment.repository.js";

const router: ExpressRouter = Router();

router.get("/platform-admin/sub-admins", authenticate, authorize(["PLATFORM_ADMIN"]), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await findAllActiveSubAdminAssignments();
    return res.json(ok(assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: (a as unknown as { user?: { name?: string | null } }).user?.name ?? null,
      email: (a as unknown as { user?: { email?: string } }).user?.email ?? null,
      collegeId: a.collegeId,
      collegeName: (a as unknown as { college?: { name?: string } }).college?.name ?? null,
      appointedAt: a.appointedAt,
    }))));
  } catch (error) {
    return next(error);
  }
});

router.get("/sub-admin/cr-assignments", authenticate, authorize(["SUB_ADMIN"]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const subAdminAssignment = await findActiveSubAdminAssignmentByUser(actor.userId);
    if (!subAdminAssignment) {
      return res.json(ok([]));
    }
    const assignments = await findActiveCrCoCrAssignmentsByCollege(subAdminAssignment.collegeId);
    return res.json(ok(assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: (a as unknown as { user?: { name?: string | null } }).user?.name ?? null,
      type: a.type,
      role: a.type,
      departmentId: a.departmentId,
      sessionId: a.sessionId,
      collegeId: a.collegeId,
      isActive: a.isActive,
      appointedAt: a.appointedAt,
    }))));
  } catch (error) {
    return next(error);
  }
});

router.post("/platform-admin/sub-admins", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: subAdminAssignmentSchema }), appointSubAdminHandler);
router.post("/platform-admin/sub-admins/:assignmentId/revoke", authenticate, authorize(["PLATFORM_ADMIN"]), revokeSubAdminHandler);
router.post("/sub-admin/cr-assignments", authenticate, authorize(["SUB_ADMIN"]), validate({ body: crCoCrAssignmentSchema }), appointCrCoCrHandler);
router.post("/sub-admin/cr-assignments/:assignmentId/revoke", authenticate, authorize(["SUB_ADMIN"]), revokeCrCoCrHandler);

export default router;
