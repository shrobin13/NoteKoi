import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../types/index.js";

/**
 * Layer-3 of the 4-layer guard stack (ai-context.md §6).
 *
 * Checks that the authenticated user's role is one of the allowed roles.
 * IMPORTANT: Never branch on CrSeat (MAIN vs CO) inside here — that
 * distinction is cosmetic only (R-015, R-016).
 *
 * @example
 *   router.post('/resources', authenticate(), requireRole(Role.CR), ...)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${roles.join(", ")}`,
        ),
      );
    }

    next();
  };
}
