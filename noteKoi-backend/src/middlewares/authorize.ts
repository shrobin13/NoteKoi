import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { findActiveSubAdminAssignmentByUser } from "../repositories/subAdminAssignment.repository.js";
import { permissionMap, type PermissionName } from "../permissions/permissionMap.js";

export type AuthorizeInput = string[] | PermissionName;

export function authorize(rolesOrPermission: AuthorizeInput) {
  const allowedRoles = Array.isArray(rolesOrPermission)
    ? rolesOrPermission
    : permissionMap[rolesOrPermission];

  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: { userId?: string; role?: string } }).user;

    if (!user?.role) {
      return next(new AppError("Authentication required", 401, "UNAUTHENTICATED"));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    if (user.role === "SUB_ADMIN") {
      const assignment = await findActiveSubAdminAssignmentByUser(user.userId ?? "");
      if (!assignment) {
        return next(new AppError("Forbidden", 403, "FORBIDDEN"));
      }
    }

    return next();
  };
}
