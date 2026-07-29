import { z } from "zod";
export const UpdateProfileSchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
});
