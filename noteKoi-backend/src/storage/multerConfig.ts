import multer from "multer";
import path from "path";
import fs from "fs";
import { env, allowedMimeTypes } from "../config/env.js";

const uploadsRoot = path.resolve(process.cwd(), "storage", "uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    // Place uploads under storage/uploads/<college|platform>
    const collegeId = (req as any).user?.collegeId;
    const scope = collegeId ? collegeId : "platform";
    const dest = path.join(uploadsRoot, scope);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req: any, file: any, cb: any) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, safeName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req: any, file: any, cb: any) => {
    if (allowedMimeTypes.length && !allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

export const uploadsRootPath = uploadsRoot;
