import { z } from "zod";
// ─── College ──────────────────────────────────────────────────────────────────
export const CreateCollegeSchema = z.object({
    name: z.string().min(2).max(200).trim(),
});
export const UpdateCollegeSchema = z.object({
    name: z.string().min(2).max(200).trim().optional(),
});
// ─── Department ───────────────────────────────────────────────────────────────
export const CreateDepartmentSchema = z.object({
    name: z.string().min(2).max(200).trim(),
    collegeId: z.string().cuid(),
});
export const UpdateDepartmentSchema = z.object({
    name: z.string().min(2).max(200).trim().optional(),
});
// ─── Semester ─────────────────────────────────────────────────────────────────
export const CreateSemesterSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    departmentId: z.string().cuid(),
});
export const UpdateSemesterSchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
});
// ─── Course ───────────────────────────────────────────────────────────────────
export const CreateCourseSchema = z.object({
    name: z.string().min(1).max(200).trim(),
    semesterId: z.string().cuid(),
});
export const UpdateCourseSchema = z.object({
    name: z.string().min(1).max(200).trim().optional(),
});
// ─── Session ──────────────────────────────────────────────────────────────────
export const CreateSessionSchema = z.object({
    name: z.string().min(1).max(100).trim(),
    courseId: z.string().cuid(),
});
export const UpdateSessionSchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
});
// ─── ClassroomUnit ────────────────────────────────────────────────────────────
// R-031: ClassroomUnit = exactly one (departmentId, sessionId) pair
export const CreateClassroomUnitSchema = z.object({
    departmentId: z.string().cuid(),
    sessionId: z.string().cuid(),
});
// ─── Pagination query ─────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});
