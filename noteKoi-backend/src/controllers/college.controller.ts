import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import { createCollegeRecord, listColleges, updateCollegeRecord } from "../services/college.service.js";

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
