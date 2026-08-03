import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import { findActiveCrCoCrAssignmentsForUser, findActiveCrCoCrAssignmentByScope } from "../repositories/crCoCrAssignment.repository.js";
import { findActiveSubAdminAssignmentByUser } from "../repositories/subAdminAssignment.repository.js";
import type { AuthenticatedRequest } from "./authenticate.js";

export type ScopedResource = {
  collegeId?: string | null;
  departmentId?: string | null;
  sessionId?: string | null;
  uploaderId?: string | null;
};

export type ResourceLookup = (req: Request) => Promise<ScopedResource | null>;

function getUser(req: Request) {
  return (req as AuthenticatedRequest).user;
}

export function requireOwnership(getResource: ResourceLookup, resourceName = "Resource", fieldName: keyof ScopedResource = "uploaderId") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const resource = await getResource(req);
    if (!resource) {
      return next(new AppError(`${resourceName} not found`, 404, "NOT_FOUND"));
    }

    if (resource[fieldName] !== user.userId) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    return next();
  };
}

export function requireSameCollege(getResource: ResourceLookup) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user || user.role !== "SUB_ADMIN") {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const assignment = await findActiveSubAdminAssignmentByUser(user.userId);
    if (!assignment) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const resource = await getResource(req);
    if (!resource) {
      return next(new AppError("Resource not found", 404, "NOT_FOUND"));
    }

    if (resource.collegeId !== assignment.collegeId) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    return next();
  };
}

export function requireDeptSessionScope(getResource: ResourceLookup) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = getUser(req);
    if (!user || user.role !== "STUDENT") {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    const resource = await getResource(req);
    if (!resource || !resource.departmentId || !resource.sessionId) {
      return next(new AppError("Resource not found", 404, "NOT_FOUND"));
    }

    const assignment = await findActiveCrCoCrAssignmentByScope(user.userId, resource.departmentId, resource.sessionId);
    if (!assignment) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }

    return next();
  };
}

export async function requireActiveSubAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req);
  if (!user || user.role !== "SUB_ADMIN") {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  const assignment = await findActiveSubAdminAssignmentByUser(user.userId);
  if (!assignment) {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  return next();
}

export async function requireActiveCrCoCr(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req);
  if (!user || user.role !== "STUDENT") {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  const assignments = await findActiveCrCoCrAssignmentsForUser(user.userId);
  if (!assignments.length) {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  return next();
}

export async function requireActiveCrCoCrOrSubAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req);
  if (!user) {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  if (user.role === "SUB_ADMIN") {
    const assignment = await findActiveSubAdminAssignmentByUser(user.userId);
    if (!assignment) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    return next();
  }

  if (user.role === "STUDENT") {
    const assignments = await findActiveCrCoCrAssignmentsForUser(user.userId);
    if (!assignments.length) {
      return next(new AppError("Forbidden", 403, "FORBIDDEN"));
    }
    return next();
  }

  return next(new AppError("Forbidden", 403, "FORBIDDEN"));
}

export async function requireActiveCrCoCrScope(req: Request, res: Response, next: NextFunction) {
  const user = getUser(req);
  if (!user || user.role !== "STUDENT") {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  const departmentId = typeof req.params.departmentId === "string" ? req.params.departmentId : undefined;
  const sessionId = typeof req.params.sessionId === "string" ? req.params.sessionId : undefined;

  if (!departmentId || !sessionId) {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  const assignment = await findActiveCrCoCrAssignmentByScope(user.userId, departmentId, sessionId);
  if (!assignment) {
    return next(new AppError("Forbidden", 403, "FORBIDDEN"));
  }

  return next();
}
