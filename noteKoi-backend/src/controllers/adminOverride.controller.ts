import type { Request, Response, NextFunction } from "express";
import { created } from "../helpers/response.js";
import { performPromotionOverride, performEmergencyAppointment, performResourceOverride } from "../services/adminOverride.service.js";

export async function promotionOverrideHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = { userId: (req as Request & { user?: { userId?: string } }).user?.userId ?? "" };
    const result = await performPromotionOverride(actor, req.body);
    return res.status(201).json(created(result));
  } catch (error) {
    return next(error);
  }
}

export async function emergencyAppointmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = { userId: (req as Request & { user?: { userId?: string } }).user?.userId ?? "" };
    const result = await performEmergencyAppointment(actor, req.body);
    return res.status(201).json(created(result));
  } catch (error) {
    return next(error);
  }
}

export async function resourceOverrideHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = { userId: (req as Request & { user?: { userId?: string } }).user?.userId ?? "" };
    const resourceId = typeof req.params.id === "string" ? req.params.id : "";
    const result = await performResourceOverride(actor, resourceId, req.body);
    return res.status(201).json(created(result));
  } catch (error) {
    return next(error);
  }
}
