import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt.js";
import { AppError } from "../errors/app.error.js";
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, CSRF_HEADER } from "../config/cookies.js";

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    role: string;
    collegeId?: string | null;
    departmentId?: string | null;
    sessionId?: string | null;
  };
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token || typeof token !== "string") {
    return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
  }

  try {
    const payload = verifyAccessToken(token);
    (req as AuthenticatedRequest).user = payload;

    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
      const csrfCookie = req.cookies?.[CSRF_COOKIE];
      const csrfHeader = req.header(CSRF_HEADER);

      if (!csrfCookie || typeof csrfCookie !== "string" || !csrfHeader || csrfHeader !== csrfCookie) {
        return next(new AppError("CSRF token validation failed", 403, "CSRF_VALIDATION_FAILED"));
      }
    }

    return next();
  } catch {
    return next(new AppError("Invalid or expired authentication token", 401, "UNAUTHENTICATED"));
  }
}
