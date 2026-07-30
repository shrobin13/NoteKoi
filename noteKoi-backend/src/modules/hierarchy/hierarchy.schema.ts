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

// ─── Bootstrap (one-shot hierarchy wizard) ────────────────────────────────────
// Creates: College (upsert) → Department → Semester → Course("General") →
//          Session → ClassroomUnit in one transaction.
export const BootstrapCollegeSchema = z.object({
  collegeName:    z.string().min(2).max(200).trim(),
  departmentName: z.string().min(2).max(200).trim(),
  sessionLabel:   z.string().min(1).max(100).trim(),
});

// ─── Add ClassroomUnit to existing Department ─────────────────────────────────
// Creates: Semester → Course("General") → Session → ClassroomUnit
// under an already-existing department.
export const AddClassroomUnitSchema = z.object({
  sessionLabel: z.string().min(1).max(100).trim(),
});

// ─── Pagination query ─────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateCollegeDto = z.infer<typeof CreateCollegeSchema>;
export type UpdateCollegeDto = z.infer<typeof UpdateCollegeSchema>;
export type CreateDepartmentDto = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof UpdateDepartmentSchema>;
export type CreateSemesterDto = z.infer<typeof CreateSemesterSchema>;
export type UpdateSemesterDto = z.infer<typeof UpdateSemesterSchema>;
export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
export type CreateClassroomUnitDto = z.infer<typeof CreateClassroomUnitSchema>;
export type BootstrapCollegeDto   = z.infer<typeof BootstrapCollegeSchema>;
export type AddClassroomUnitDto   = z.infer<typeof AddClassroomUnitSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
