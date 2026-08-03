import { AppError } from "../errors/app.error.js";
import {
  findResourceById,
  openResourceForReview,
  approveResourceAndSupersede,
  rejectResource,
  markResourceDeletedByUploader,
  setDeletionFlag,
  createDeletionRequestAndSetState,
  decideDeletionRequest,
  createReportAndSetInReview,
  resubmitResource,
  updateResourceStateWithModerator,
} from "../repositories/resource.repository.js";
import { $Enums } from "../../generated/prisma/client.js";

export async function openForReview(moderatorId: string, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.state !== $Enums.ResourceState.PENDING) {
    throw new AppError("Resource must be PENDING to open for review", 409, "INVALID_STATE");
  }

  const updated = await openResourceForReview(resourceId, moderatorId);
  return updated;
}

export async function approve(moderatorId: string, resourceId: string, reason?: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.state !== $Enums.ResourceState.IN_REVIEW) {
    throw new AppError("Resource must be IN_REVIEW to approve", 409, "INVALID_STATE");
  }

  // If uploader flagged deletion while in review, an approve acts as deletion approval
  if (resource.deletionFlag) {
    const updated = await updateResourceStateWithModerator(resourceId, { state: $Enums.ResourceState.DELETED, moderatorId, moderatorReason: reason ?? null });
    return updated;
  }

  const updated = await approveResourceAndSupersede(resourceId, moderatorId, reason);
  return updated;
}

export async function reject(moderatorId: string, resourceId: string, reason: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.state !== $Enums.ResourceState.IN_REVIEW) {
    throw new AppError("Resource must be IN_REVIEW to reject", 409, "INVALID_STATE");
  }

  const updated = await rejectResource(resourceId, moderatorId, reason);
  return updated;
}

export async function selfCancel(uploaderId: string, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.uploaderId !== uploaderId) throw new AppError("Forbidden", 403, "FORBIDDEN");
  if (resource.state !== $Enums.ResourceState.PENDING) {
    throw new AppError("Only PENDING resources may be self-cancelled", 409, "INVALID_STATE");
  }

  const updated = await markResourceDeletedByUploader(resourceId);
  return updated;
}

export async function flagDeletion(uploaderId: string, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.uploaderId !== uploaderId) throw new AppError("Forbidden", 403, "FORBIDDEN");
  if (resource.state !== $Enums.ResourceState.IN_REVIEW) {
    throw new AppError("Deletion may only be flagged while IN_REVIEW", 409, "INVALID_STATE");
  }

  const updated = await setDeletionFlag(resourceId, true);
  return updated;
}

export async function requestDeletion(uploaderId: string, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.uploaderId !== uploaderId) throw new AppError("Forbidden", 403, "FORBIDDEN");
  if (resource.state !== $Enums.ResourceState.APPROVED) {
    throw new AppError("Deletion may only be requested for APPROVED resources", 409, "INVALID_STATE");
  }

  const dr = await createDeletionRequestAndSetState(resourceId, uploaderId);
  return dr;
}

export async function deletionDecision(requestId: string, decidedById: string, approve: boolean, reason?: string) {
  const dr = await decideDeletionRequest(requestId, decidedById, approve, reason ?? undefined);
  return dr;
}

export async function resubmit(uploaderId: string, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.uploaderId !== uploaderId) throw new AppError("Forbidden", 403, "FORBIDDEN");
  if (resource.state !== $Enums.ResourceState.REJECTED) {
    throw new AppError("Only REJECTED resources may be resubmitted", 409, "INVALID_STATE");
  }

  const updated = await resubmitResource(resourceId);
  return updated;
}

export async function reportSubmission(reportedById: string, resourceId: string, reason: string, note?: string | null) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  // Reports are only allowed against Approved or Deletion Requested resources
  if (!(resource.state === $Enums.ResourceState.APPROVED || resource.state === $Enums.ResourceState.DELETION_REQUESTED)) {
    throw new AppError("Reports can only be filed against APPROVED or DELETION_REQUESTED resources", 409, "INVALID_STATE");
  }

  const report = await createReportAndSetInReview(resourceId, reportedById, reason, note ?? null);
  return report;
}

export default {
  openForReview,
  approve,
  reject,
  selfCancel,
  flagDeletion,
  requestDeletion,
  deletionDecision,
  resubmit,
  reportSubmission,
};
