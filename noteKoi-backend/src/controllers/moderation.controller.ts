import type { Request, Response, NextFunction } from "express";
import { ok, created } from "../helpers/response.js";
import * as stateMachine from "../services/resourceStateMachine.service.js";

export async function openReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as any).user || {};
    const updated = await stateMachine.openForReview(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function approveHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const reason = req.body?.reason ?? null;
    const actor = (req as any).user || {};
    const updated = await stateMachine.approve(actor.userId, id, reason ?? undefined);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function rejectHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const reason = req.body?.reason;
    const actor = (req as any).user || {};
    const updated = await stateMachine.reject(actor.userId, id, reason);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function selfCancelHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as any).user || {};
    const updated = await stateMachine.selfCancel(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function flagDeletionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as any).user || {};
    const updated = await stateMachine.flagDeletion(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function requestDeletionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as any).user || {};
    const dr = await stateMachine.requestDeletion(actor.userId, id);
    return res.status(201).json(created(dr));
  } catch (error) {
    return next(error);
  }
}

export async function deletionDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const approve = Boolean(req.body?.approve);
    const reason = req.body?.reason ?? null;
    const actor = (req as any).user || {};
    const dr = await stateMachine.deletionDecision(id, actor.userId, approve, reason ?? undefined);
    return res.json(ok(dr));
  } catch (error) {
    return next(error);
  }
}

export async function reportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const reason = req.body?.reason;
    const note = req.body?.note ?? null;
    const actor = (req as any).user || {};
    const report = await stateMachine.reportSubmission(actor.userId, id, reason, note ?? null);
    return res.status(201).json(created(report));
  } catch (error) {
    return next(error);
  }
}

export async function resubmitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as any).user || {};
    const updated = await stateMachine.resubmit(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export default {
  openReviewHandler,
  approveHandler,
  rejectHandler,
  selfCancelHandler,
  flagDeletionHandler,
  requestDeletionHandler,
  deletionDecisionHandler,
  reportHandler,
  resubmitHandler,
};
