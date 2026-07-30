import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "../../../generated/prisma/index.js";
import {
  CreateNoticeSchema,
  UpdateNoticeSchema,
  NoticeQuerySchema,
} from "./notices.schema.js";
import * as ctrl from "./notices.controller.js";

const router: Router = Router();

// GET /api/notices/unit/:classroomUnitId — Notices for a classroom unit (verified members)
router.get(
  "/unit/:classroomUnitId",
  authenticate({ requireVerified: true }),
  validateWithDetails(NoticeQuerySchema, "query"),
  ctrl.getNotices,
);

// POST /api/notices — Create notice (CR only)
router.post(
  "/",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  validateWithDetails(CreateNoticeSchema),
  ctrl.createNotice,
);

// PATCH /api/notices/:id — Update notice (CR only)
router.patch(
  "/:id",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  validateWithDetails(UpdateNoticeSchema),
  ctrl.updateNotice,
);

// DELETE /api/notices/:id — Delete notice (CR only)
router.delete(
  "/:id",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  ctrl.deleteNotice,
);

export default router;
