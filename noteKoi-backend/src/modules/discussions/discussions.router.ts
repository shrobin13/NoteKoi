import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validateWithDetails } from "../../middlewares/validate.js";
import { Role } from "@prisma/client";
import {
  CreateGroupSchema,
  AddMemberSchema,
  SendMessageSchema,
  MessageQuerySchema,
} from "./discussions.schema.js";
import * as ctrl from "./discussions.controller.js";

const router: Router = Router();

// GET /api/discussions/unit/:classroomUnitId — Get groups for classroom unit
router.get(
  "/unit/:classroomUnitId",
  authenticate({ requireVerified: true }),
  ctrl.getGroups,
);

// POST /api/discussions/groups — Create group (CR only)
router.post(
  "/groups",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  validateWithDetails(CreateGroupSchema),
  ctrl.createGroup,
);

// POST /api/discussions/groups/:groupId/members — Add member (CR only)
router.post(
  "/groups/:groupId/members",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  validateWithDetails(AddMemberSchema),
  ctrl.addMember,
);

// DELETE /api/discussions/groups/:groupId/members/:userId — Remove member (CR only)
router.delete(
  "/groups/:groupId/members/:userId",
  authenticate({ requireVerified: true }),
  requireRole(Role.CR),
  ctrl.removeMember,
);

// GET /api/discussions/groups/:groupId/messages — Get messages in group
router.get(
  "/groups/:groupId/messages",
  authenticate({ requireVerified: true }),
  validateWithDetails(MessageQuerySchema, "query"),
  ctrl.getMessages,
);

// POST /api/discussions/groups/:groupId/messages — Send message in group
router.post(
  "/groups/:groupId/messages",
  authenticate({ requireVerified: true }),
  validateWithDetails(SendMessageSchema),
  ctrl.sendMessage,
);

export default router;
