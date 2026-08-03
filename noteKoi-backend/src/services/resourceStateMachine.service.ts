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
import { createNotification } from "../repositories/notification.repository.js";
import { findLatestPromotedEventByResource } from "../repositories/promotion.repository.js";
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

    await createNotification({
      data: {
        user: { connect: { id: resource.uploaderId } },
        resource: { connect: { id: resourceId } },
        type: $Enums.NotificationType.DELETION_APPROVED,
        message: `Your resource deletion request was approved.`,
        reason: reason ?? null,
      },
    });

    return updated;
  }

  const updated = await approveResourceAndSupersede(resourceId, moderatorId, reason);

  await createNotification({
    data: {
      user: { connect: { id: resource.uploaderId } },
      resource: { connect: { id: resourceId } },
      type: $Enums.NotificationType.RESOURCE_APPROVED,
      message: `Your resource "${resource.title}" was approved.`,
      reason: reason ?? null,
    },
  });

  return updated;
}

export async function reject(moderatorId: string, resourceId: string, reason: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.state !== $Enums.ResourceState.IN_REVIEW) {
    throw new AppError("Resource must be IN_REVIEW to reject", 409, "INVALID_STATE");
  }

  const updated = await rejectResource(resourceId, moderatorId, reason);

  // Check if resource had a prior promotion event (was previously promoted to PLATFORM)
  const priorPromotedEvent = await findLatestPromotedEventByResource(resourceId);

  if (priorPromotedEvent) {
    // Promoted resource later rejected on re-review
    if (priorPromotedEvent.path === $Enums.PromotionPath.PATH_A) {
      // Path A: uploader + CR/Co-CR who recommended + Sub Admin who approved
      const recipients = new Set<string>();
      recipients.add(resource.uploaderId);
      if (priorPromotedEvent.recommendation?.recommendedById) {
        recipients.add(priorPromotedEvent.recommendation.recommendedById);
      }
      if (priorPromotedEvent.actorId) {
        recipients.add(priorPromotedEvent.actorId);
      }

      for (const userId of recipients) {
        await createNotification({
          data: {
            user: { connect: { id: userId } },
            resource: { connect: { id: resourceId } },
            type: $Enums.NotificationType.PROMOTED_RESOURCE_LATER_REJECTED,
            message: `Promoted resource "${resource.title}" was rejected upon re-review.`,
            reason,
          },
        });
      }
    } else {
      // Path B: Sub Admin only (not teacher uploader per §3.8 / §0.2 Teacher)
      if (priorPromotedEvent.actorId) {
        await createNotification({
          data: {
            user: { connect: { id: priorPromotedEvent.actorId } },
            resource: { connect: { id: resourceId } },
            type: $Enums.NotificationType.PROMOTED_RESOURCE_LATER_REJECTED,
            message: `Promoted teacher resource "${resource.title}" was rejected upon re-review.`,
            reason,
          },
        });
      }
    }
  } else {
    // Normal rejection: notify uploader
    await createNotification({
      data: {
        user: { connect: { id: resource.uploaderId } },
        resource: { connect: { id: resourceId } },
        type: $Enums.NotificationType.RESOURCE_REJECTED,
        message: `Your resource "${resource.title}" was rejected.`,
        reason,
      },
    });
  }

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

  if (dr) {
    await createNotification({
      data: {
        user: { connect: { id: dr.requestedById } },
        resource: { connect: { id: dr.resourceId } },
        type: approve ? $Enums.NotificationType.DELETION_APPROVED : $Enums.NotificationType.DELETION_DENIED,
        message: approve ? `Your deletion request was approved.` : `Your deletion request was denied.`,
        reason: reason ?? null,
      },
    });
  }

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
