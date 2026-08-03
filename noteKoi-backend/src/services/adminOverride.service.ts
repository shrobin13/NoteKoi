import { AppError } from "../errors/app.error.js";
import { $Enums } from "../../generated/prisma/client.js";
import { createAdminOverrideLog } from "../repositories/adminOverrideLog.repository.js";
import { approvePromotionRecommendation, denyPromotionRecommendation, promoteResourceBySubAdmin } from "./promotion.service.js";
import { findResourceById, approveResourceAndSupersede, rejectResource, updateResourceStateWithModerator } from "../repositories/resource.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { createSubAdminAssignmentWithRoleUpdate } from "../repositories/subAdminAssignment.repository.js";
import { createCrCoCrAssignment } from "../repositories/crCoCrAssignment.repository.js";

export async function performPromotionOverride(actor: { userId: string }, input: { action: string; targetId: string; justificationNote: string; reason?: string | null }) {
  if (!actor.userId) throw new AppError("Authentication required", 401, "UNAUTHENTICATED");

  if (!input.justificationNote?.trim()) {
    throw new AppError("Justification note is required", 422, "JUSTIFICATION_REQUIRED");
  }

  let result;
  if (input.action === "APPROVE_RECOMMENDATION") {
    result = await approvePromotionRecommendation(actor, input.targetId, input.reason ?? null);
  } else if (input.action === "DENY_RECOMMENDATION") {
    result = await denyPromotionRecommendation(actor, input.targetId, input.reason ?? null);
  } else if (input.action === "PROMOTE_RESOURCE") {
    result = await promoteResourceBySubAdmin(actor, input.targetId);
  } else {
    throw new AppError("Unsupported override action", 422, "UNSUPPORTED_ACTION");
  }

  await createAdminOverrideLog({
    actorId: actor.userId,
    overrideType: $Enums.OverrideType.PROMOTION_DECISION,
    targetType: "PromotionRecommendation",
    targetId: input.targetId,
    action: input.action,
    justificationNote: input.justificationNote,
  });

  return result;
}

export async function performEmergencyAppointment(actor: { userId: string }, input: { userId: string; type: string; scope?: { collegeId?: string; departmentId?: string; sessionId?: string }; justificationNote: string }) {
  if (!actor.userId) throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  if (!input.justificationNote?.trim()) throw new AppError("Justification note is required", 422, "JUSTIFICATION_REQUIRED");

  const targetUser = await findUserById(input.userId);
  if (!targetUser) throw new AppError("Target user not found", 404, "USER_NOT_FOUND");

  let appointment;
  if (input.type === "SUB_ADMIN") {
    const collegeId = input.scope?.collegeId || targetUser.collegeId;
    if (!collegeId) throw new AppError("College ID is required for Sub Admin appointment", 422, "COLLEGE_REQUIRED");

    appointment = await createSubAdminAssignmentWithRoleUpdate({
      userId: input.userId,
      collegeId,
      appointedById: actor.userId,
      role: $Enums.Role.SUB_ADMIN,
    });
  } else if (input.type === "CR" || input.type === "CO_CR") {
    const collegeId = input.scope?.collegeId || targetUser.collegeId;
    const departmentId = input.scope?.departmentId || targetUser.departmentId;
    const sessionId = input.scope?.sessionId || targetUser.sessionId;

    if (!collegeId || !departmentId || !sessionId) {
      throw new AppError("College, Department, and Session IDs are required for CR/Co-CR appointment", 422, "SCOPE_REQUIRED");
    }

    const typeEnum = input.type === "CO_CR" ? $Enums.CrCoCrType.CO_CR : $Enums.CrCoCrType.CR;
    appointment = await createCrCoCrAssignment({
      userId: input.userId,
      collegeId,
      departmentId,
      sessionId,
      type: typeEnum,
      appointedById: actor.userId,
      isEmergencyAppointment: true,
    });
  } else {
    throw new AppError("Unsupported appointment type", 422, "UNSUPPORTED_TYPE");
  }

  const log = await createAdminOverrideLog({
    actorId: actor.userId,
    overrideType: $Enums.OverrideType.ROLE_APPOINTMENT,
    targetType: "User",
    targetId: input.userId,
    action: `APPOINT_${input.type}`,
    justificationNote: input.justificationNote,
  });

  return { appointment, log };
}

export async function performResourceOverride(actor: { userId: string }, resourceId: string, input: { action: "APPROVE" | "REJECT" | "DELETE"; justificationNote: string }) {
  if (!actor.userId) throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  if (!input.justificationNote?.trim()) throw new AppError("Justification note is required", 422, "JUSTIFICATION_REQUIRED");

  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");

  let updatedResource;
  if (input.action === "APPROVE") {
    updatedResource = await approveResourceAndSupersede(resourceId, actor.userId, input.justificationNote);
  } else if (input.action === "REJECT") {
    updatedResource = await rejectResource(resourceId, actor.userId, input.justificationNote);
  } else if (input.action === "DELETE") {
    updatedResource = await updateResourceStateWithModerator(resourceId, {
      state: $Enums.ResourceState.DELETED,
      moderatorId: actor.userId,
      moderatorReason: input.justificationNote,
    });
  } else {
    throw new AppError("Unsupported resource override action", 422, "UNSUPPORTED_ACTION");
  }

  const log = await createAdminOverrideLog({
    actorId: actor.userId,
    overrideType: $Enums.OverrideType.RESOURCE_CRUD,
    targetType: "Resource",
    targetId: resourceId,
    action: input.action,
    justificationNote: input.justificationNote,
  });

  return { resource: updatedResource, log };
}
