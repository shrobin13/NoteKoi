import { Request, Response, NextFunction } from "express";
import * as noticesService from "./notices.service.js";
import { success, getParam } from "../../types/index.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

export async function getNotices(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const classroomUnitId = getParam(req, "classroomUnitId");
    const result = await noticesService.getNotices(classroomUnitId, req.query as never, caller);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function createNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const notice = await noticesService.createNotice(req.body, caller);
    res.status(201).json(success(notice, "Notice created"));
  } catch (err) {
    next(err);
  }
}

export async function updateNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const noticeId = getParam(req, "id");
    const notice = await noticesService.updateNotice(noticeId, req.body, caller);
    res.status(200).json(success(notice, "Notice updated"));
  } catch (err) {
    next(err);
  }
}

export async function deleteNotice(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const noticeId = getParam(req, "id");
    await noticesService.deleteNotice(noticeId, caller);
    res.status(200).json(success(null, "Notice deleted"));
  } catch (err) {
    next(err);
  }
}
