import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import {
  approveStudentVerificationHandler,
  approveTeacherVerificationHandler,
  listStudentVerificationsForCrHandler,
  listStudentVerificationsForSubAdminHandler,
  listTeacherVerificationsForSubAdminHandler,
} from "../controllers/studentVerification.controller.js";
import { requireActiveCrCoCr, requireActiveCrCoCrOrSubAdmin, requireActiveSubAdmin } from "../middlewares/scopeGuards.js";

const router: ExpressRouter = Router();

router.get(
  "/cr/student-verifications",
  authenticate,
  authorize(["STUDENT"]),
  requireActiveCrCoCr,
  listStudentVerificationsForCrHandler,
);
router.get(
  "/sub-admin/student-verifications",
  authenticate,
  authorize(["SUB_ADMIN"]),
  requireActiveSubAdmin,
  listStudentVerificationsForSubAdminHandler,
);
router.post(
  "/student-verifications/:userId/approve",
  authenticate,
  authorize(["STUDENT", "SUB_ADMIN"]),
  requireActiveCrCoCrOrSubAdmin,
  approveStudentVerificationHandler,
);
router.get(
  "/sub-admin/teacher-verifications",
  authenticate,
  authorize(["SUB_ADMIN"]),
  requireActiveSubAdmin,
  listTeacherVerificationsForSubAdminHandler,
);
router.post(
  "/sub-admin/teacher-verifications/:userId/approve",
  authenticate,
  authorize(["SUB_ADMIN"]),
  requireActiveSubAdmin,
  approveTeacherVerificationHandler,
);

export default router;
