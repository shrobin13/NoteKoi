import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import { createSessionRecord, listSessionsByDepartment, updateSessionRecord } from "../services/session.service.js";

export async function listSessionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const departmentId = typeof req.params.departmentId === "string" ? req.params.departmentId : "";
    const sessions = await listSessionsByDepartment(departmentId);
    return res.json(ok(sessions));
  } catch (error) {
    return next(error);
  }
}

export async function createSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await createSessionRecord(req.body);
    return res.status(201).json(ok(session));
  } catch (error) {
    return next(error);
  }
}

export async function updateSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const session = await updateSessionRecord(id, req.body);
    return res.json(ok(session));
  } catch (error) {
    return next(error);
  }
}
