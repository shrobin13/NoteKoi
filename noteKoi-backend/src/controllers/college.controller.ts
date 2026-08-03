import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import {
  adoptDepartmentIntoCollege,
  createCollegeRecord,
  listCollegeDepartments,
  listColleges,
  revokeDepartmentFromCollege,
  updateCollegeRecord,
} from "../services/college.service.js";

export async function listCollegesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const colleges = await listColleges();
    return res.json(ok(colleges));
  } catch (error) {
    return next(error);
  }
}

export async function createCollegeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const college = await createCollegeRecord(req.body);
    return res.status(201).json(ok(college));
  } catch (error) {
    return next(error);
  }
}

export async function updateCollegeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const college = await updateCollegeRecord(id, req.body);
    return res.json(ok(college));
  } catch (error) {
    return next(error);
  }
}

export async function listCollegeDepartmentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const collegeId = typeof req.params.collegeId === "string" ? req.params.collegeId : "";
    const departments = await listCollegeDepartments(collegeId);
    return res.json(ok(departments));
  } catch (error) {
    return next(error);
  }
}

export async function adoptDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const collegeId = typeof req.params.collegeId === "string" ? req.params.collegeId : "";
    const departmentId = typeof req.body.departmentId === "string" ? req.body.departmentId : "";
    const adoption = await adoptDepartmentIntoCollege(collegeId, departmentId);
    return res.status(201).json(ok(adoption));
  } catch (error) {
    return next(error);
  }
}

export async function revokeDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const collegeId = typeof req.params.collegeId === "string" ? req.params.collegeId : "";
    const departmentId = typeof req.params.departmentId === "string" ? req.params.departmentId : "";
    const result = await revokeDepartmentFromCollege(collegeId, departmentId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}
