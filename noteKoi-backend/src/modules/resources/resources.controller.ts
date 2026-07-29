import { Request, Response, NextFunction } from "express";
import * as resourcesService from "./resources.service.js";
import { success, ApiError, getParam } from "../../types/index.js";
import { Visibility, Role } from "../../../generated/prisma/index.js";

// GET /api/resources/public — Unauthenticated public resources search & browsing
export async function getPublicResources(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await resourcesService.getPublicResources(req.query as any);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

// GET /api/resources/:id — Public preview or private view if verified member
export async function getResourceById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req, "id");
    const resource = await resourcesService.getResourceById(id);

    // If resource is private, check that request has authenticated + verified user
    if (resource.visibility === Visibility.PRIVATE) {
      if (!req.user) {
        return next(ApiError.unauthorized("Authentication required for private resources"));
      }

      // Check scope: user must belong to same College or be Owner Admin
      if (
        req.user.role !== Role.OWNER_ADMIN &&
        req.user.collegeId !== resource.classroomUnit.department.collegeId
      ) {
        return next(ApiError.forbidden("You do not have access to this private resource"));
      }

      if (
        req.user.role === Role.STUDENT ||
        req.user.role === Role.CR
      ) {
        if (req.user.classroomUnitId !== resource.classroomUnitId) {
          return next(ApiError.forbidden("Resource belongs to a different ClassroomUnit"));
        }
      }
    }

    res.json(success(resource));
  } catch (err) {
    next(err);
  }
}

// GET /api/resources/unit/:classroomUnitId — Unit-scoped resources (VERIFIED users only)
export async function getUnitResources(req: Request, res: Response, next: NextFunction) {
  try {
    const classroomUnitId = getParam(req, "classroomUnitId");
    const result = await resourcesService.getUnitResources(classroomUnitId, req.query as any);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

// POST /api/resources — Create resource (CR only)
export async function createResource(req: Request, res: Response, next: NextFunction) {
  try {
    const resource = await resourcesService.createResource(req.body, req.user!.id);
    res.status(201).json(success(resource, "Resource created successfully"));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/resources/:id — Update resource (CR only)
export async function updateResource(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req, "id");
    const resource = await resourcesService.updateResource(
      id,
      req.body,
      req.user!.classroomUnitId!,
    );
    res.json(success(resource, "Resource updated successfully"));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/resources/:id — Delete resource (CR only)
export async function deleteResource(req: Request, res: Response, next: NextFunction) {
  try {
    const id = getParam(req, "id");
    await resourcesService.deleteResource(id, req.user!.classroomUnitId!);
    res.json(success(null, "Resource deleted successfully"));
  } catch (err) {
    next(err);
  }
}
