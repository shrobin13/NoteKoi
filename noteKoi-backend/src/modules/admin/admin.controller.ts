import { Request, Response, NextFunction } from "express";
import * as adminService from "./admin.service.js";
import { success, getParam } from "../../types/index.js";

export async function assignSubAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.assignSubAdmin(req.body, req.user!.id);
    res.status(201).json(success(result, "Sub Admin assigned successfully"));
  } catch (err) { next(err); }
}

export async function demoteSubAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.demoteSubAdmin(getParam(req, "userId"), req.user!.id);
    res.json(success(null, "Sub Admin demoted successfully"));
  } catch (err) { next(err); }
}

export async function transferOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    await adminService.transferOwnership(req.body, req.user!.id);
    res.json(success(null, "Ownership transferred successfully"));
  } catch (err) { next(err); }
}

export async function getPlatformStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getPlatformStats();
    res.json(success(stats));
  } catch (err) { next(err); }
}

export async function listSubAdmins(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await adminService.listSubAdmins();
    res.json(success(list));
  } catch (err) { next(err); }
}
