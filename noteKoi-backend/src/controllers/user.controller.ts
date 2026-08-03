import type { Request, Response, NextFunction } from "express";
import { created, ok } from "../helpers/response.js";
import { getCurrentUserProfile, registerStudent, registerTeacher } from "../services/user.service.js";

export async function getCurrentUserProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUserProfile((req as Request & { user?: { userId?: string } }).user?.userId ?? "");
    return res.json(ok(user));
  } catch (error) {
    return next(error);
  }
}

export async function registerStudentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerStudent(req.body);
    return res.status(201).json(created(user));
  } catch (error) {
    return next(error);
  }
}

export async function registerTeacherHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerTeacher(req.body);
    return res.status(201).json(created(user));
  } catch (error) {
    return next(error);
  }
}
