import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { appointCrCoCrHandler, appointSubAdminHandler, revokeCrCoCrHandler, revokeSubAdminHandler } from "../controllers/subAdmin.controller.js";
import { validate } from "../middlewares/validate.js";
import { subAdminAssignmentSchema, crCoCrAssignmentSchema } from "../validators/roleAssignment.validator.js";

const router: ExpressRouter = Router();

router.post("/platform-admin/sub-admins", authenticate, authorize(["PLATFORM_ADMIN"]), validate({ body: subAdminAssignmentSchema }), appointSubAdminHandler);
router.post("/platform-admin/sub-admins/:assignmentId/revoke", authenticate, authorize(["PLATFORM_ADMIN"]), revokeSubAdminHandler);
router.post("/sub-admin/cr-assignments", authenticate, authorize(["SUB_ADMIN"]), validate({ body: crCoCrAssignmentSchema }), appointCrCoCrHandler);
router.post("/sub-admin/cr-assignments/:assignmentId/revoke", authenticate, authorize(["SUB_ADMIN"]), revokeCrCoCrHandler);

export default router;
