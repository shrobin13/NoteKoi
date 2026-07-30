import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError, getParam } from "../types/index.js";
import prisma from "../lib/prisma.js";

type ScopeType = "classroomUnit" | "college";

/**
 * Layer-4 of the 4-layer guard stack (ai-context.md §6).
 *
 * Verifies that the acting user has rights over the specific record they are
 * trying to touch. Scope is resolved via a DB join — never trust the JWT
 * alone for scope checks.
 */
export function requireScope(scopeType: ScopeType) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());

    // Owner Admin has no scope restriction (ai-context.md §3)
    if (req.user.role === Role.OWNER_ADMIN) return next();

    try {
      if (scopeType === "classroomUnit") {
        await requireClassroomUnitScope(req, next);
      } else {
        await requireCollegeScope(req, next);
      }
    } catch (err) {
      next(err);
    }
  };
}

async function requireClassroomUnitScope(
  req: Request,
  next: NextFunction,
): Promise<void> {
  const targetId =
    getParam(req, "classroomUnitId") ||
    (req.body as Record<string, unknown>)["classroomUnitId"];

  if (!targetId || typeof targetId !== "string") {
    return next(
      ApiError.badRequest(
        "classroomUnitId is required for scope check",
        "SCOPE_PARAM_MISSING",
      ),
    );
  }

  if (req.user!.role === Role.CR) {
    // Verify the acting CR has an active assignment for this exact unit
    const assignment = await prisma.cRAssignment.findFirst({
      where: {
        userId: req.user!.id,
        classroomUnitId: targetId,
        isActive: true,
      },
    });
    if (!assignment) {
      return next(
        ApiError.forbidden(
          "You do not have CR rights over this classroom unit",
        ),
      );
    }
    return next();
  }

  // Sub Admin can access all units within their college
  if (req.user!.role === Role.SUB_ADMIN) {
    // Resolve unit → department → college, then compare
    const unit = await prisma.classroomUnit.findUnique({
      where: { id: targetId },
      include: { department: { select: { collegeId: true } } },
    });
    if (!unit) return next(ApiError.notFound("ClassroomUnit not found"));

    if (unit.department.collegeId !== req.user!.collegeId) {
      return next(
        ApiError.forbidden(
          "This classroom unit is outside your college scope",
        ),
      );
    }
    return next();
  }

  return next(ApiError.forbidden());
}

async function requireCollegeScope(
  req: Request,
  next: NextFunction,
): Promise<void> {
  const targetCollegeId =
    getParam(req, "collegeId") ||
    (req.body as Record<string, unknown>)["collegeId"];

  if (!targetCollegeId || typeof targetCollegeId !== "string") {
    return next(
      ApiError.badRequest(
        "collegeId is required for scope check",
        "SCOPE_PARAM_MISSING",
      ),
    );
  }

  if (req.user!.role === Role.SUB_ADMIN) {
    // Sub Admin's own college comes from their AdminAssignment
    const assignment = await prisma.adminAssignment.findFirst({
      where: {
        userId: req.user!.id,
        role: "SUB_ADMIN",
        isActive: true,
        collegeId: targetCollegeId,
      },
    });
    if (!assignment) {
      return next(
        ApiError.forbidden("This college is outside your admin scope"),
      );
    }
    return next();
  }

  return next(ApiError.forbidden());
}
