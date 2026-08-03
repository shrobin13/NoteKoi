import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import { createDepartmentRecord, listDepartments, updateDepartmentRecord } from "../services/department.service.js";

export async function listDepartmentsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await listDepartments();
    return res.json(ok(departments));
  } catch (error) {
    return next(error);
  }
}

export async function createDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await createDepartmentRecord(req.body);
    return res.status(201).json(ok(department));
  } catch (error) {
    return next(error);
  }
}

export async function updateDepartmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const department = await updateDepartmentRecord(id, req.body);
    return res.json(ok(department));
  } catch (error) {
    return next(error);
  }
}
