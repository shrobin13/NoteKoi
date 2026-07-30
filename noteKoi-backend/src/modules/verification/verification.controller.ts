import { Request, Response, NextFunction } from "express";
import * as verificationService from "./verification.service.js";
import { success, getParam } from "../../types/index.js";

export async function requestVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await verificationService.requestVerification(req.user!.id, req.body);
    res.status(201).json(success(result, "Verification request submitted"));
  } catch (err) { next(err); }
}

export async function getPendingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = "1", limit = "20" } = req.query as { page?: string; limit?: string };
    const result = await verificationService.getPendingRequests(
      req.user!.id,
      req.user!.role,
      req.user!.collegeId,
      req.user!.classroomUnitId,
      { page: parseInt(page), limit: parseInt(limit) },
    );
    res.json(success(result));
  } catch (err) { next(err); }
}

export async function approveVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const requestId = getParam(req, "requestId");
    const result = await verificationService.approveVerification(requestId, req.user!.id);
    res.json(success(result, "Verification approved"));
  } catch (err) { next(err); }
}

export async function rejectVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const requestId = getParam(req, "requestId");
    const result = await verificationService.rejectVerification(requestId, req.user!.id);
    res.json(success(result, "Verification rejected"));
  } catch (err) { next(err); }
}
