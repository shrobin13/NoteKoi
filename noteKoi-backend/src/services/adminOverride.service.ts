import { AppError } from "../errors/app.error.js";
import { $Enums } from "../../generated/prisma/client.js";
import { createAdminOverrideLog } from "../repositories/adminOverrideLog.repository.js";
import { approvePromotionRecommendation, denyPromotionRecommendation, promoteResourceBySubAdmin } from "./promotion.service.js";

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

  // Only write log for now per spec
  const log = await createAdminOverrideLog({
    actorId: actor.userId,
    overrideType: $Enums.OverrideType.ROLE_APPOINTMENT,
    targetType: "User",
    targetId: input.userId,
    action: `APPOINT_${input.type}`,
    justificationNote: input.justificationNote,
  });

  return log;
}

export async function performResourceOverride(actor: { userId: string }, resourceId: string, input: { action: "APPROVE" | "REJECT" | "DELETE"; justificationNote: string }) {
  if (!actor.userId) throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  if (!input.justificationNote?.trim()) throw new AppError("Justification note is required", 422, "JUSTIFICATION_REQUIRED");

  // Record the override
  const log = await createAdminOverrideLog({
    actorId: actor.userId,
    overrideType: $Enums.OverrideType.RESOURCE_CRUD,
    targetType: "Resource",
    targetId: resourceId,
    action: input.action,
    justificationNote: input.justificationNote,
  });

  return log;
}
