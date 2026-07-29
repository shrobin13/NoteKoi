import { z } from "zod";
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
//# sourceMappingURL=users.schema.d.ts.map