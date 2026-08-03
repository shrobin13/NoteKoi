import type { Request, Response, NextFunction } from "express";
import { created, ok } from "../helpers/response.js";
import { appointCrCoCr, revokeCrCoCr } from "../services/crCoCr.service.js";
import { appointSubAdmin, revokeSubAdmin } from "../services/subAdmin.service.js";

function getActor(req: Request) {
  return {
    userId: (req as Request & { user?: { userId?: string } }).user?.userId ?? "",
  };
}

export async function appointSubAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await appointSubAdmin(getActor(req), req.body);
    return res.status(201).json(created(result));
  } catch (error) {
    return next(error);
  }
}

export async function revokeSubAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : "";
    const result = await revokeSubAdmin(getActor(req), assignmentId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}

export async function appointCrCoCrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await appointCrCoCr(getActor(req), req.body);
    return res.status(201).json(created(result));
  } catch (error) {
    return next(error);
  }
}

export async function revokeCrCoCrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const assignmentId = typeof req.params.assignmentId === "string" ? req.params.assignmentId : "";
    const result = await revokeCrCoCr(getActor(req), assignmentId);
    return res.json(ok(result));
  } catch (error) {
    return next(error);
  }
}
