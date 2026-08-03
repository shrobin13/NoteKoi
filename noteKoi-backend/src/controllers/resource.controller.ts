import type { Request, Response, NextFunction } from "express";
import { created, ok } from "../helpers/response.js";
import { createResourceRecord } from "../services/resource.service.js";
import { getResourceById } from "../services/resource.service.js";
import { updateResourceMetadata } from "../services/resource.service.js";
import { reassignResource } from "../services/resource.service.js";
import { createResourceVersion } from "../services/resource.service.js";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { uploadsRootPath } from "../storage/multerConfig.js";

export async function createResourceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resource = await createResourceRecord(req.body);
    return res.status(201).json(created(resource));
  } catch (error) {
    return next(error);
  }
}

export async function createResourceUploadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file;
    // assemble input for service
    const auth = (req as any).user || {};

    const tagsRaw = (req as any).body?.tags;
    const tags = typeof tagsRaw === "string" ? tagsRaw.split(",").map((s) => s.trim()).filter(Boolean) : Array.isArray(tagsRaw) ? tagsRaw : [];

    const relativePath = file ? path.relative(process.cwd(), file.path) : undefined;
    const fileUrl = relativePath ? `/${relativePath.replaceAll(path.sep, "/")}` : undefined;

    let contentHash: string | undefined;
    if (file) {
      const buf = await fs.readFile(file.path);
      contentHash = crypto.createHash("sha256").update(buf).digest("hex");
    }

    const input = {
      uploaderId: auth.userId ?? req.body.uploaderId,
      uploaderRoleSnapshot: (auth.role ?? req.body.uploaderRoleSnapshot) as any,
      resourceType: req.body.resourceType,
      title: req.body.title,
      description: req.body.description ?? null,
      tags,
      courseId: req.body.courseId,
      departmentId: req.body.departmentId,
      sessionId: req.body.sessionId ?? undefined,
      visibility: req.body.visibility,
      collegeId: req.body.collegeId ?? undefined,
      fileUrl: fileUrl ?? null,
      youtubeUrl: req.body.youtubeUrl ?? null,
      contentHash: contentHash ?? null,
    };

    const resource = await createResourceRecord(input as any);
    return res.status(201).json(created(resource));
  } catch (error) {
    return next(error);
  }
}

export async function getMyUploadsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const actor = (req as any).user || {};

    const result = await (await import("../services/resource.service.js")).listMyUploads(actor, page ?? 1, limit ?? 20);
    return res.json(ok(result.data, result.meta));
  } catch (error) {
    return next(error);
  }
}

export async function getResourceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const includeOtherColleges = req.query?.includeOtherColleges === "true" || req.query?.includeOtherColleges === "1";

    // Optional authentication: verify access token if present
    let actor: any = null;
    try {
      const { ACCESS_TOKEN_COOKIE } = await import("../config/cookies.js");
      const { verifyAccessToken } = await import("../auth/jwt.js");
      const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
      if (token && typeof token === "string") {
        actor = verifyAccessToken(token);
      }
    } catch (e) {
      // ignore token verification errors and treat as guest
    }

    const resource = await getResourceById(actor, id, includeOtherColleges);
    return res.json(ok(resource));
  } catch (error) {
    return next(error);
  }
}

export async function updateResourceMetadataHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const payload = req.body;
    const actor = (req as any).user || {};

    const updated = await updateResourceMetadata(actor, id, payload);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function reassignResourceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const payload = req.body;
    const actor = (req as any).user || {};

    const updated = await reassignResource(actor, id, payload);
    return res.json(ok(updated));
  } catch (error) {
    return next(error);
  }
}

export async function createResourceVersionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const payload = req.body;
    const actor = (req as any).user || {};

    const created = await createResourceVersion(actor, id, payload);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}
