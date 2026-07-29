import { Request, Response, NextFunction } from "express";
import * as crService from "./cr.service.js";
import { success, getParam } from "../../types/index.js";

export async function assignCR(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await crService.assignCR(req.body, req.user!.id);
    res.status(201).json(success(result, "CR assigned successfully"));
  } catch (err) { next(err); }
}

export async function demoteCR(req: Request, res: Response, next: NextFunction) {
  try {
    await crService.demoteCR(req.body, req.user!.id);
    res.json(success(null, "CR demoted successfully"));
  } catch (err) { next(err); }
}

export async function listCRsForUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const classroomUnitId = getParam(req, "classroomUnitId");
    const crs = await crService.listCRsForUnit(classroomUnitId);
    res.json(success(crs));
  } catch (err) { next(err); }
}
