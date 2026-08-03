import { z } from "zod";

export const createCollegeSchema = z.object({
  name: z.string().trim().min(1),
  isActive: z.boolean().optional(),
});

export const updateCollegeSchema = z.object({
  name: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1),
});

export const updateDepartmentSchema = z.object({
  name: z.string().trim().min(1).optional(),
});

export const createSessionSchema = z.object({
  departmentId: z.string().min(1),
  label: z.string().trim().min(1),
  isOpen: z.boolean().optional(),
});

export const updateSessionSchema = z.object({
  label: z.string().trim().min(1).optional(),
  isOpen: z.boolean().optional(),
});

export const createCourseSchema = z.object({
  departmentId: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().max(1000).optional().nullable(),
});

export const updateCourseSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const departmentIdParamSchema = z.object({
  departmentId: z.string().min(1),
});
