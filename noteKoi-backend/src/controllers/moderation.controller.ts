import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticate.js";
import { ok, created } from "../helpers/response.js";
import * as stateMachine from "../services/resourceStateMachine.service.js";
import { prisma } from "../prisma/prisma.js";
import { findActiveCrCoCrAssignmentsForUser } from "../repositories/crCoCrAssignment.repository.js";
import { findActiveSubAdminAssignmentByUser } from "../repositories/subAdminAssignment.repository.js";

export async function openReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as AuthenticatedRequest).user;
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
    const actor = (req as AuthenticatedRequest).user;
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
    const actor = (req as AuthenticatedRequest).user;
    const updated = await stateMachine.reject(actor.userId, id, reason);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function selfCancelHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as AuthenticatedRequest).user;
    const updated = await stateMachine.selfCancel(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function flagDeletionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as AuthenticatedRequest).user;
    const updated = await stateMachine.flagDeletion(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function requestDeletionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as AuthenticatedRequest).user;
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
    const actor = (req as AuthenticatedRequest).user;
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
    const actor = (req as AuthenticatedRequest).user;
    const report = await stateMachine.reportSubmission(actor.userId, id, reason, note ?? null);
    return res.status(201).json(created(report));
  } catch (error) {
    return next(error);
  }
}

export async function resubmitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as AuthenticatedRequest).user;
    const updated = await stateMachine.resubmit(actor.userId, id);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function resolveReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = (req as AuthenticatedRequest).user;
    const report = await prisma.report.update({
      where: { id },
      data: { status: "RESOLVED", resolvedBy: { connect: { id: actor.userId } }, resolvedAt: new Date() },
    });

    return res.json(ok(report));
  } catch (error) {
    return next(error);
  }
}

export async function getCrQueueHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const assignments = await findActiveCrCoCrAssignmentsForUser(actor.userId);
    if (!assignments.length) {
      return res.json(ok({ items: [] }));
    }

    const ors = assignments.map((a) => ({ departmentId: a.departmentId, sessionId: a.sessionId }));

    const where: any = {
      state: "PENDING",
      visibility: "COLLEGE",
      uploader: { role: "STUDENT" },
      OR: ors,
    };

    const items = await prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' }, include: { uploader: { select: { id: true, email: true, role: true } }, deletionRequests: { take: 1, orderBy: { requestedAt: 'desc' } } } });

    return res.json(ok({ items }));
  } catch (error) {
    return next(error);
  }
}

export async function getSubAdminQueueHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = (req as AuthenticatedRequest).user;
    const assignment = await findActiveSubAdminAssignmentByUser(actor.userId);
    if (!assignment) {
      return res.json(ok({ pendingTeacherUploads: [], pendingPlatformResources: [], escalations: [], promotionRecommendations: [] }));
    }

    const pendingTeacherUploads = await prisma.resource.findMany({
      where: { state: "PENDING", "uploader": { role: "TEACHER" }, collegeId: assignment.collegeId },
      orderBy: { createdAt: 'desc' },
      include: { uploader: { select: { id: true, email: true, role: true } }, deletionRequests: { take: 1, orderBy: { requestedAt: 'desc' } } },
    });

    const pendingPlatformResources = await prisma.resource.findMany({
      where: { state: "PENDING", visibility: "PLATFORM" },
      orderBy: { createdAt: 'desc' },
      include: { uploader: { select: { id: true, email: true, role: true } }, deletionRequests: { take: 1, orderBy: { requestedAt: 'desc' } } },
    });

    const escalations = await prisma.resource.findMany({ where: { state: "IN_REVIEW" }, orderBy: { moderatorDecisionAt: 'desc' }, include: { uploader: { select: { id: true, email: true, role: true } } } });

    const promotionRecommendations = await prisma.promotionRecommendation.findMany({ where: { status: "PENDING" }, include: { resource: true, recommendedBy: { select: { id: true, email: true } } }, orderBy: { recommendedAt: 'desc' } });

    return res.json(ok({ pendingTeacherUploads, pendingPlatformResources, escalations, promotionRecommendations }));
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
