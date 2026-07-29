import { z } from "zod";
export declare const CreateCollegeSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const UpdateCollegeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateDepartmentSchema: z.ZodObject<{
    name: z.ZodString;
    collegeId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateDepartmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateSemesterSchema: z.ZodObject<{
    name: z.ZodString;
    departmentId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateSemesterSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateCourseSchema: z.ZodObject<{
    name: z.ZodString;
    semesterId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateCourseSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateSessionSchema: z.ZodObject<{
    name: z.ZodString;
    courseId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateSessionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const CreateClassroomUnitSchema: z.ZodObject<{
    departmentId: z.ZodString;
    sessionId: z.ZodString;
}, z.core.$strip>;
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
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
export type PaginationDto = z.infer<typeof PaginationSchema>;
//# sourceMappingURL=hierarchy.schema.d.ts.map