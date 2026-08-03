import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: { role?: string } }).user;

    if (!user?.role) {
      return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    return next();
  };
}
