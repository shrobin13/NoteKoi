import { z } from "zod";
export declare const AssignSubAdminSchema: z.ZodObject<{
    userId: z.ZodString;
    collegeId: z.ZodString;
}, z.core.$strip>;
export declare const DemoteSubAdminSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const TransferOwnershipSchema: z.ZodObject<{
    newOwnerUserId: z.ZodString;
}, z.core.$strip>;
export type AssignSubAdminDto = z.infer<typeof AssignSubAdminSchema>;
export type DemoteSubAdminDto = z.infer<typeof DemoteSubAdminSchema>;
export type TransferOwnershipDto = z.infer<typeof TransferOwnershipSchema>;
//# sourceMappingURL=admin.schema.d.ts.map