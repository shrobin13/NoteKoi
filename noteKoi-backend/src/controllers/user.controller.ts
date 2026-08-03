import type { Request, Response, NextFunction } from "express";
import { created, ok } from "../helpers/response.js";
import { getCurrentUserProfile, getCurrentUserAssignments, updateUserProfile, registerStudent, registerTeacher } from "../services/user.service.js";

export async function getCurrentUserProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUserProfile((req as Request & { user?: { userId?: string } }).user?.userId ?? "");
    return res.json(ok(user));
  } catch (error) {
    return next(error);
  }
}

export async function updateUserProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId ?? "";
    const user = await updateUserProfile(userId, req.body);
    return res.json(ok(user));
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUserAssignmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId ?? "";
    const assignments = await getCurrentUserAssignments(userId);
    return res.json(ok(assignments));
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
