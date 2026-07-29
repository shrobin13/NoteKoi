import { z } from "zod";
export declare const RequestVerificationSchema: z.ZodObject<{
    classroomUnitId: z.ZodString;
}, z.core.$strip>;
export declare const ApproveVerificationSchema: z.ZodObject<{
    requestId: z.ZodString;
}, z.core.$strip>;
export type RequestVerificationDto = z.infer<typeof RequestVerificationSchema>;
//# sourceMappingURL=verification.schema.d.ts.map