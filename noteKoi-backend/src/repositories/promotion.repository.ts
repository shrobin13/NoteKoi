import { prisma } from "../prisma/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { $Enums } from "../../generated/prisma/client.js";

export function findPendingPromotionRecommendationByResource(resourceId: string) {
  return prisma.promotionRecommendation.findFirst({
    where: { resourceId, status: $Enums.PromotionRecommendationStatus.PENDING },
  });
}

export function findPromotionRecommendationById(id: string) {
  return prisma.promotionRecommendation.findUnique({ where: { id } });
}

export function createPromotionRecommendation(resourceId: string, recommendedById: string) {
  return prisma.promotionRecommendation.create({
    data: {
      resource: { connect: { id: resourceId } },
      recommendedBy: { connect: { id: recommendedById } },
      status: $Enums.PromotionRecommendationStatus.PENDING,
    },
  });
}

export function updatePromotionRecommendationStatus(
  id: string,
  status: $Enums.PromotionRecommendationStatus,
  decidedById?: string,
  invalidationReason?: string | null,
) {
  return prisma.promotionRecommendation.update({
    where: { id },
    data: {
      status,
      decidedBy: decidedById ? { connect: { id: decidedById } } : undefined,
      decidedAt: new Date(),
      invalidatedAt: status === $Enums.PromotionRecommendationStatus.INVALIDATED ? new Date() : undefined,
      invalidationReason: invalidationReason ?? null,
    },
  });
}

export function invalidatePendingPromotionRecommendations(resourceId: string, reason: string) {
  return prisma.promotionRecommendation.updateMany({
    where: { resourceId, status: $Enums.PromotionRecommendationStatus.PENDING },
    data: {
      status: $Enums.PromotionRecommendationStatus.INVALIDATED,
      invalidatedAt: new Date(),
      invalidationReason: reason,
    },
  });
}

export function createPromotionEvent(data: {
  resourceId: string;
  path: $Enums.PromotionPath;
  action: $Enums.PromotionEventAction;
  actorId: string;
  recommendationId?: string | null;
  isExceptionalOverride?: boolean;
  justificationNote?: string | null;
}) {
  return prisma.promotionEvent.create({
    data: {
      resource: { connect: { id: data.resourceId } },
      path: data.path,
      action: data.action,
      actor: { connect: { id: data.actorId } },
      recommendation: data.recommendationId ? { connect: { id: data.recommendationId } } : undefined,
      isExceptionalOverride: data.isExceptionalOverride ?? false,
      justificationNote: data.justificationNote ?? null,
    },
  });
}

export function findPromotionEventsByResource(resourceId: string) {
  return prisma.promotionEvent.findMany({
    where: { resourceId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createPromotionRecommendationAndEventInTransaction(resourceId: string, recommendedById: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const recommendation = await tx.promotionRecommendation.create({
      data: {
        resource: { connect: { id: resourceId } },
        recommendedBy: { connect: { id: recommendedById } },
        status: $Enums.PromotionRecommendationStatus.PENDING,
      },
    });

    await tx.promotionEvent.create({
      data: {
        resource: { connect: { id: resourceId } },
        path: $Enums.PromotionPath.PATH_A,
        action: $Enums.PromotionEventAction.PROMOTED,
        actor: { connect: { id: actorId } },
        recommendation: { connect: { id: recommendation.id } },
      },
    });

    return recommendation;
  });
}
