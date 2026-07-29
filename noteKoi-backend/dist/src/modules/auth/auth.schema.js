import { z } from "zod";
export const RegisterSchema = z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72, "Password must be at most 72 characters"),
    collegeId: z.string().cuid("Invalid college ID"),
    classroomUnitId: z.string().cuid("Invalid classroom unit ID"),
});
export const LoginSchema = z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
});
export const RefreshSchema = z.object({
    refreshToken: z.string().min(1),
});
