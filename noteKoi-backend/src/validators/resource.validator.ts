import { z } from "zod";
import { $Enums } from "../../generated/prisma/client.js";

export const createResourceSchema = z.object({
  resourceType: z.enum(["CLASS_NOTES", "LECTURE_NOTES", "SYLLABUS", "VIDEO", "PYQ", "BOOK_PDF"]),
  title: z.string().trim().min(1),
  description: z.string().trim().max(1000).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  courseId: z.string().min(1),
  departmentId: z.string().min(1),
  sessionId: z.string().min(1).optional(),
  visibility: z.enum(["COLLEGE", "PLATFORM"]).optional().default("COLLEGE"),
  collegeId: z.string().min(1).optional(),
  fileUrl: z.string().min(1).optional(),  // relative path from multer disk storage
  youtubeUrl: z.string().url().optional(),
  contentHash: z.string().min(1).optional(),
});

export const myUploadsQuerySchema = z.object({
  page: z.preprocess((v) => Number(v), z.number().int().positive().default(1)).optional(),
  limit: z.preprocess((v) => Number(v), z.number().int().positive().max(100).default(20)).optional(),
});

export const listResourcesQuerySchema = z.object({
  page: z.preprocess((v) => Number(v), z.number().int().positive().default(1)).optional(),
  limit: z.preprocess((v) => Number(v), z.number().int().positive().max(100).default(20)).optional(),
  q: z.string().trim().min(1).optional(),
  resourceType: z.enum(Object.values($Enums.ResourceType) as [string, ...string[]]).optional(),
  sessionId: z.string().min(1).optional(),
  visibility: z.enum(Object.values($Enums.Visibility) as [string, ...string[]]).optional(),
  includeOtherColleges: z.preprocess((v) => {
    if (v === undefined) return false;
    if (typeof v === "string") return v === "true" || v === "1";
    return Boolean(v);
  }, z.boolean()).optional().default(false),
});

export const resourceIdParamSchema = z.object({
  id: z.string().min(1),
});

export const viewResourceQuerySchema = z.object({
  includeOtherColleges: z.preprocess((v) => {
    if (v === undefined) return false;
    if (typeof v === 'string') return v === 'true' || v === '1';
    return Boolean(v);
  }, z.boolean()).optional().default(false),
});

export const resourceMetadataSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

export const resourceReassignSchema = z.object({
  courseId: z.string().min(1),
  departmentId: z.string().min(1),
  sessionId: z.string().min(1).optional(),
});

export const resourceVersionSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  tags: z.array(z.string().trim().min(1)).optional(),
  fileUrl: z.string().min(1).optional(),  // relative path from multer disk storage
  youtubeUrl: z.string().url().optional(),
  sessionId: z.string().min(1).optional(),
});
