import { z } from "zod";
import { Visibility } from "@prisma/client";

const RESOURCE_CATEGORIES = ["Lecture", "Notes", "PYQ", "Tutorial", "Software", "Other"] as const;

export const CreateResourceSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  category: z.enum(RESOURCE_CATEGORIES),
  visibility: z.nativeEnum(Visibility).default(Visibility.PRIVATE),
  fileId: z.string().min(1, "Google Drive fileId is required"),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
  previewUrl: z.string().url("previewUrl must be a valid URL").optional(),
  courseId: z.string().cuid().optional(),
  classroomUnitId: z.string().cuid(),
});

export const UpdateResourceSchema = z.object({
  title: z.string().min(1).max(300).trim().optional(),
  category: z.enum(RESOURCE_CATEGORIES).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  fileId: z.string().min(1).optional(),
  fileUrl: z.string().url().optional(),
  previewUrl: z.string().url().optional(),
  courseId: z.string().cuid().nullable().optional(),
});

export const PublicResourceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.enum(RESOURCE_CATEGORIES).optional(),
  courseId: z.string().cuid().optional(),
  departmentId: z.string().cuid().optional(),
});

export const PrivateResourceQuerySchema = PublicResourceQuerySchema.extend({
  classroomUnitId: z.string().cuid().optional(),
});

export type CreateResourceDto = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceDto = z.infer<typeof UpdateResourceSchema>;
export type PublicResourceQueryDto = z.infer<typeof PublicResourceQuerySchema>;
export type PrivateResourceQueryDto = z.infer<typeof PrivateResourceQuerySchema>;
