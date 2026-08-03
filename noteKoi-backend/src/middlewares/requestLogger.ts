import type { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = (req as Request & { user?: { userId?: string } }).user?.userId;

    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration,
        userId,
      },
      "HTTP request",
    );
  });

  next();
}
