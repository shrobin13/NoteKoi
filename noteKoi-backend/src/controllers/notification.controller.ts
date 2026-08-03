import type { Request, Response, NextFunction } from "express";
import { ok } from "../helpers/response.js";
import { listNotifications, markNotificationAsRead } from "../services/notification.service.js";

export async function listNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId ?? "";
    const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const result = await listNotifications(userId, page, limit);
    return res.json(ok(result.data, result.meta));
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId ?? "";
    const notificationId = typeof req.params.id === "string" ? req.params.id : "";
    const notification = await markNotificationAsRead(userId, notificationId);
    return res.json(ok(notification));
  } catch (error) {
    return next(error);
  }
}
