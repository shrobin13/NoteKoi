import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback, MulterError } from "multer";
import path from "path";
import fs from "fs";
import { env, allowedMimeTypes } from "../config/env.js";
import { AppError } from "../errors/app.error.js";

const uploadsRoot = path.resolve(process.cwd(), "storage", "uploads");

type UploadRequest = Request & { user?: { collegeId?: string | null } };

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: UploadRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Place uploads under storage/uploads/<college|platform>
    const collegeId = req.user?.collegeId;
    const scope = collegeId ? collegeId : "platform";
    const dest = path.join(uploadsRoot, scope);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req: UploadRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req: UploadRequest, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimeTypes.length && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

export const uploadsRootPath = uploadsRoot;

export function mapMulterError(err: unknown): AppError {
  if (err instanceof MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return new AppError("File too large", 413, "FILE_TOO_LARGE");
      case "LIMIT_FILE_COUNT":
        return new AppError("Too many files uploaded", 400, "FILE_COUNT_EXCEEDED");
      case "LIMIT_PART_COUNT":
        return new AppError("Too many parts in upload request", 400, "UPLOAD_PART_COUNT_EXCEEDED");
      case "LIMIT_UNEXPECTED_FILE":
        return new AppError("Unexpected file field", 400, "UNEXPECTED_FILE_FIELD");
      default:
        return new AppError("Upload failed", 400, "UPLOAD_FAILED");
    }
  }

  if (err instanceof Error && err.message === "Invalid file type") {
    return new AppError("Unsupported file type", 415, "INVALID_FILE_TYPE");
  }

  return new AppError("Upload failed", 400, "UPLOAD_FAILED");
}

export function uploadSingleFile(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return next(mapMulterError(err));
    }
    return next();
  });
}
