import { z } from "zod";
export declare const CreateResourceSchema: z.ZodObject<{
    title: z.ZodString;
    category: z.ZodEnum<{
        Lecture: "Lecture";
        Notes: "Notes";
        Other: "Other";
        PYQ: "PYQ";
        Software: "Software";
        Tutorial: "Tutorial";
    }>;
    visibility: z.ZodDefault<z.ZodEnum<{
        PUBLIC: 'PUBLIC';
        PRIVATE: 'PRIVATE';
    }>>;
    fileId: z.ZodString;
    fileUrl: z.ZodString;
    previewUrl: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodString>;
    classroomUnitId: z.ZodString;
}, z.core.$strip>;
export declare const UpdateResourceSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        Lecture: "Lecture";
        Notes: "Notes";
        Other: "Other";
        PYQ: "PYQ";
        Software: "Software";
        Tutorial: "Tutorial";
    }>>;
    visibility: z.ZodOptional<z.ZodEnum<{
        PUBLIC: 'PUBLIC';
        PRIVATE: 'PRIVATE';
    }>>;
    fileId: z.ZodOptional<z.ZodString>;
    fileUrl: z.ZodOptional<z.ZodString>;
    previewUrl: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const PublicResourceQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        Lecture: "Lecture";
        Notes: "Notes";
        Other: "Other";
        PYQ: "PYQ";
        Software: "Software";
        Tutorial: "Tutorial";
    }>>;
    courseId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const PrivateResourceQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        Lecture: "Lecture";
        Notes: "Notes";
        Other: "Other";
        PYQ: "PYQ";
        Software: "Software";
        Tutorial: "Tutorial";
    }>>;
    courseId: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    classroomUnitId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateResourceDto = z.infer<typeof CreateResourceSchema>;
export type UpdateResourceDto = z.infer<typeof UpdateResourceSchema>;
export type PublicResourceQueryDto = z.infer<typeof PublicResourceQuerySchema>;
export type PrivateResourceQueryDto = z.infer<typeof PrivateResourceQuerySchema>;
//# sourceMappingURL=resources.schema.d.ts.map