import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { CSRF_COOKIE, CSRF_HEADER } from "../config/cookies.js";

export function csrfGuard(req: Request, res: Response, next: NextFunction) {
  const csrfCookie = req.cookies?.[CSRF_COOKIE];
  const csrfHeader = req.header(CSRF_HEADER);

  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  if (!csrfCookie || typeof csrfCookie !== "string" || !csrfHeader || csrfHeader !== csrfCookie) {
    return next(new AppError("CSRF token validation failed", 403, "CSRF_VALIDATION_FAILED"));
  }

  return next();
}
