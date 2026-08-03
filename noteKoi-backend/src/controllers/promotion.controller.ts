import type { Request, Response, NextFunction } from "express";
import { created, ok } from "../helpers/response.js";
import { approvePromotionRecommendation, denyPromotionRecommendation, promoteResourceBySubAdmin, recommendPromotion, revokePromotion } from "../services/promotion.service.js";

function getActor(req: Request) {
  return {
    userId: (req as Request & { user?: { userId?: string } }).user?.userId ?? "",
  };
}

export async function recommendPromotionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resourceId = typeof req.params.id === "string" ? req.params.id : "";
    const result = await recommendPromotion(getActor(req), resourceId);
    return res.status(201).json(created(result));
  } catch (error) {
    return next(error);
  }
}

export async function recommendationApproveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const recommendationId = typeof req.params.id === "string" ? req.params.id : "";
    const result = await approvePromotionRecommendation(getActor(req), recommendationId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function recommendationDenyHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const recommendationId = typeof req.params.id === "string" ? req.params.id : "";
    const result = await denyPromotionRecommendation(getActor(req), recommendationId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function promoteResourceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resourceId = typeof req.params.id === "string" ? req.params.id : "";
    const result = await promoteResourceBySubAdmin(getActor(req), resourceId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function revokePromotionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resourceId = typeof req.params.id === "string" ? req.params.id : "";
    const result = await revokePromotion(getActor(req), resourceId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}
