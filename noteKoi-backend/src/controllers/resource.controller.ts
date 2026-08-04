import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticate.js";
import { created, ok } from "../helpers/response.js";
import { AppError } from "../errors/app.error.js";
import { createResourceRecord } from "../services/resource.service.js";
import { getResourceById } from "../services/resource.service.js";
import { updateResourceMetadata } from "../services/resource.service.js";
import { reassignResource } from "../services/resource.service.js";
import { createResourceVersion } from "../services/resource.service.js";
import { getResourceVersions } from "../services/resource.service.js";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";

type RequestWithUser = Request & { user?: AuthenticatedRequest["user"] };
type RequestWithUpload = RequestWithUser & { file?: Express.Multer.File };

type CreateResourceRecordInput = Parameters<typeof createResourceRecord>[0];

export async function createResourceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = ((req as RequestWithUser).user ?? {}) as { userId?: string; role?: string };
    const body = req.body as Record<string, unknown>;
    const input: CreateResourceRecordInput = {
      resourceType: body.resourceType as CreateResourceRecordInput["resourceType"],
      title: body.title as string,
      description: (body.description as string) ?? null,
      tags: Array.isArray(body.tags) ? body.tags.map((tag) => String(tag)) : [],
      courseId: body.courseId as string,
      departmentId: body.departmentId as string,
      sessionId: (body.sessionId as string) ?? undefined,
      visibility: (body.visibility as CreateResourceRecordInput["visibility"]) ?? undefined,
      collegeId: (body.collegeId as string) ?? undefined,
      fileUrl: (body.fileUrl as string) ?? null,
      youtubeUrl: (body.youtubeUrl as string) ?? null,
      contentHash: (body.contentHash as string) ?? null,
    };

    const resource = await createResourceRecord(input, actor);
    return res.status(201).json(created(resource));
  } catch (error) {
    return next(error);
  }
}

async function getOptionalActor(req: Request) {
  try {
    const { ACCESS_TOKEN_COOKIE } = await import("../config/cookies.js");
    const { verifyAccessToken } = await import("../auth/jwt.js");
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (token && typeof token === "string") {
      return verifyAccessToken(token);
    }
  } catch {
    // Ignore token verification issues and treat as guest.
  }

  return null;
}

export async function listResourcesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = (await getOptionalActor(req)) as { userId?: string; role?: string; collegeId?: string | null; departmentId?: string | null; sessionId?: string | null } | null;
    const page = typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 20;
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const resourceType = typeof req.query.resourceType === "string" ? req.query.resourceType : undefined;
    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : undefined;
    const visibility = typeof req.query.visibility === "string" ? req.query.visibility : undefined;
    const includeOtherColleges = req.query.includeOtherColleges === "true" || req.query.includeOtherColleges === "1";

    const result = await (await import("../services/resource.service.js")).listResources(actor, { q, resourceType, sessionId, visibility, includeOtherColleges }, page, limit);
    return res.json(ok({ items: result.data, ...result.meta }));
  } catch (error) {
    return next(error);
  }
}

/**
 * Pure file-upload handler — stores the file and returns { fileUrl, contentHash }.
 * The caller then POSTs to /resources with the returned fileUrl to create the record.
 */
export async function createResourceUploadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const uploadReq = req as RequestWithUpload;
    const file = uploadReq.file;

    if (!file) {
      throw new AppError("No file uploaded — include a 'file' field in the multipart form", 400, "FILE_REQUIRED");
    }

    const relativePath = path.relative(process.cwd(), file.path);
    const fileUrl = `/${relativePath.replaceAll(path.sep, "/")}`;

    const buf = await fs.readFile(file.path);
    const contentHash = crypto.createHash("sha256").update(buf).digest("hex");

    return res.status(200).json(ok({ fileUrl, contentHash }));
  } catch (error) {
    return next(error);
  }
}

export async function getMyUploadsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = typeof req.query.page === "string" ? Number(req.query.page) : undefined;
    const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const actor = ((req as RequestWithUser).user ?? {}) as { userId?: string };

    const result = await (await import("../services/resource.service.js")).listMyUploads(actor, page ?? 1, limit ?? 20);
    return res.json(ok({ items: result.data, ...result.meta }));
  } catch (error) {
    return next(error);
  }
}

export async function getResourceHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const includeOtherColleges = req.query?.includeOtherColleges === "true" || req.query?.includeOtherColleges === "1";

    // Optional authentication: verify access token if present
    let actor: AuthenticatedRequest["user"] | null = null;
    try {
      const { ACCESS_TOKEN_COOKIE } = await import("../config/cookies.js");
      const { verifyAccessToken } = await import("../auth/jwt.js");
      const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
      if (token && typeof token === "string") {
        actor = verifyAccessToken(token);
      }
    } catch {
      // ignore token verification errors and treat as guest
    }

    const resource = await getResourceById(actor, id, includeOtherColleges);
    return res.json(ok(resource));
  } catch (error) {
    return next(error);
  }
}

export async function getResourceVersionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const actor = ((req as RequestWithUser).user ?? null) as { userId?: string; role?: string; collegeId?: string | null; departmentId?: string | null; sessionId?: string | null } | null;
    const versions = await getResourceVersions(actor, id);
    return res.json(ok(versions));
  } catch (error) {
    return next(error);
  }
}

export async function updateResourceMetadataHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : "";
    const payload = req.body;
    const actor = ((req as RequestWithUser).user ?? {}) as { userId?: string };

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
    const actor = ((req as RequestWithUser).user ?? {}) as { userId?: string; role?: string; collegeId?: string | null; departmentId?: string | null };

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
    const actor = ((req as RequestWithUser).user ?? {}) as { userId?: string; role?: string; collegeId?: string | null };

    const created = await createResourceVersion(actor, id, payload);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}
