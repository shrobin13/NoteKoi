import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import { approveStudentVerification, approveTeacherVerification, listStudentVerificationsForCr, listStudentVerificationsForSubAdmin, listPendingTeachersForSubAdmin } from "../services/studentVerification.service.js";

function getActor(req: Request) {
  const user = (req as Request & { user?: { userId?: string; collegeId?: string | null } }).user;
  return {
    userId: user?.userId ?? "",
    collegeId: user?.collegeId ?? null,
  };
}

export async function listStudentVerificationsForCrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listStudentVerificationsForCr(getActor(req));
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function listStudentVerificationsForSubAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listStudentVerificationsForSubAdmin({ collegeId: getActor(req).collegeId });
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function approveStudentVerificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : "";
    const result = await approveStudentVerification(getActor(req), userId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function listTeacherVerificationsForSubAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listPendingTeachersForSubAdmin({ collegeId: getActor(req).collegeId });
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function approveTeacherVerificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = typeof req.params.userId === "string" ? req.params.userId : "";
    const result = await approveTeacherVerification(getActor(req), userId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}
