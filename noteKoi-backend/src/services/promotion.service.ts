import { AppError } from "../errors/app.error.js";
import { $Enums } from "../../generated/prisma/client.js";
import { findResourceById, updateResourceVisibility } from "../repositories/resource.repository.js";
import { createPromotionRecommendation, createPromotionEvent, findPendingPromotionRecommendationByResource, findPromotionRecommendationById, invalidatePendingPromotionRecommendations, updatePromotionRecommendationStatus } from "../repositories/promotion.repository.js";
import { createNotification } from "../repositories/notification.repository.js";

export async function recommendPromotion(actor: { userId: string; role?: string | null }, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.state !== $Enums.ResourceState.APPROVED) throw new AppError("Resource must be approved", 409, "INVALID_STATE");
  if (resource.visibility !== $Enums.Visibility.COLLEGE) throw new AppError("Only college resources may be recommended", 409, "INVALID_STATE");
  if (resource.uploaderRoleSnapshot !== $Enums.Role.STUDENT) throw new AppError("Only student resources may use Path A", 409, "INVALID_STATE");

  const existing = await findPendingPromotionRecommendationByResource(resourceId);
  if (existing) throw new AppError("A pending promotion recommendation already exists", 409, "PROMOTION_RECOMMENDATION_EXISTS");

  const recommendation = await createPromotionRecommendation(resourceId, actor.userId);
  return recommendation;
}

export async function approvePromotionRecommendation(actor: { userId: string }, recommendationId: string, reason?: string | null) {
  const recommendation = await findPromotionRecommendationById(recommendationId);
  if (!recommendation) throw new AppError("Promotion recommendation not found", 404, "NOT_FOUND");
  if (recommendation.status !== $Enums.PromotionRecommendationStatus.PENDING) throw new AppError("Promotion recommendation is no longer pending", 409, "INVALID_STATE");

  const resource = await findResourceById(recommendation.resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");

  await updatePromotionRecommendationStatus(recommendationId, $Enums.PromotionRecommendationStatus.APPROVED, actor.userId);
  await updateResourceVisibility(resource.id, $Enums.Visibility.PLATFORM);
  await createPromotionEvent({
    resourceId: resource.id,
    path: $Enums.PromotionPath.PATH_A,
    action: $Enums.PromotionEventAction.PROMOTED,
    actorId: actor.userId,
    recommendationId,
  });

  await createNotification({
    data: {
      user: { connect: { id: resource.uploaderId } },
      resource: { connect: { id: resource.id } },
      type: $Enums.NotificationType.PROMOTION_RECOMMENDATION_APPROVED,
      message: `Your resource was promoted to platform visibility.`,
      reason: reason ?? null,
    },
  });

  const recommendedById = recommendation.recommendedById;
  if (recommendedById) {
    await createNotification({
      data: {
        user: { connect: { id: recommendedById } },
        resource: { connect: { id: resource.id } },
        type: $Enums.NotificationType.PROMOTION_RECOMMENDATION_APPROVED,
        message: `Your recommendation for this resource was approved.`,
        reason: reason ?? null,
      },
    });
  }

  return { recommendationId, resourceId: resource.id };
}

export async function denyPromotionRecommendation(actor: { userId: string }, recommendationId: string, reason?: string | null) {
  const recommendation = await findPromotionRecommendationById(recommendationId);
  if (!recommendation) throw new AppError("Promotion recommendation not found", 404, "NOT_FOUND");
  if (recommendation.status !== $Enums.PromotionRecommendationStatus.PENDING) throw new AppError("Promotion recommendation is no longer pending", 409, "INVALID_STATE");

  await updatePromotionRecommendationStatus(recommendationId, $Enums.PromotionRecommendationStatus.DENIED, actor.userId, reason ?? null);

  const resource = await findResourceById(recommendation.resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");

  const recommendedById = recommendation.recommendedById;
  if (recommendedById) {
    await createNotification({
      data: {
        user: { connect: { id: recommendedById } },
        resource: { connect: { id: resource.id } },
        type: $Enums.NotificationType.PROMOTION_RECOMMENDATION_DENIED,
        message: `Your recommendation for this resource was denied.`,
        reason: reason ?? null,
      },
    });
  }

  return { recommendationId, resourceId: resource.id };
}

export async function promoteResourceBySubAdmin(actor: { userId: string }, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.state !== $Enums.ResourceState.APPROVED) throw new AppError("Resource must be approved", 409, "INVALID_STATE");
  if (resource.visibility !== $Enums.Visibility.COLLEGE) throw new AppError("Only college resources can be promoted", 409, "INVALID_STATE");
  if (resource.uploaderRoleSnapshot !== $Enums.Role.TEACHER) throw new AppError("Only teacher resources may use Path B", 409, "INVALID_STATE");

  await updateResourceVisibility(resource.id, $Enums.Visibility.PLATFORM);
  await createPromotionEvent({
    resourceId: resource.id,
    path: $Enums.PromotionPath.PATH_B,
    action: $Enums.PromotionEventAction.PROMOTED,
    actorId: actor.userId,
  });

  return { resourceId: resource.id };
}

export async function revokePromotion(actor: { userId: string }, resourceId: string) {
  const resource = await findResourceById(resourceId);
  if (!resource) throw new AppError("Resource not found", 404, "NOT_FOUND");
  if (resource.visibility !== $Enums.Visibility.PLATFORM) throw new AppError("Only platform resources can be revoked", 409, "INVALID_STATE");

  await updateResourceVisibility(resource.id, $Enums.Visibility.COLLEGE);
  await createPromotionEvent({
    resourceId: resource.id,
    path: $Enums.PromotionPath.PATH_B,
    action: $Enums.PromotionEventAction.REVOKED,
    actorId: actor.userId,
  });

  return { resourceId: resource.id };
}

export async function invalidateRecommendations(resourceId: string, reason: string) {
  await invalidatePendingPromotionRecommendations(resourceId, reason);
}
