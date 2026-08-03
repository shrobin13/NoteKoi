import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../auth/jwt.js";
import { AppError } from "../errors/app.error.js";
import { ACCESS_TOKEN_COOKIE } from "../config/cookies.js";

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
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired authentication token", 401, "UNAUTHENTICATED"));
  }
}
