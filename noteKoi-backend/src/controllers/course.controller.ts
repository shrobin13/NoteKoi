import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import { createCourseRecord, listCoursesByDepartment, updateCourseRecord } from "../services/course.service.js";

export async function listCoursesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = typeof req.params.departmentId === "string" ? req.params.departmentId : "";
    const courses = await listCoursesByDepartment(departmentId);
    return res.json(ok(courses));
  } catch (error) {
    return next(error);
  }
}

export async function createCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await createCourseRecord(req.body);
    return res.status(201).json(ok(course));
  } catch (error) {
    return next(error);
  }
}

export async function updateCourseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const course = await updateCourseRecord(id, req.body);
    return res.json(ok(course));
  } catch (error) {
    return next(error);
  }
}
