import { z } from "zod";
export declare const AssignCRSchema: z.ZodObject<{
    userId: z.ZodString;
    classroomUnitId: z.ZodString;
    seat: z.ZodEnum<{
        MAIN: 'MAIN';
        CO: 'CO';
    }>;
}, z.core.$strip>;
export declare const DemoteCRSchema: z.ZodObject<{
    userId: z.ZodString;
    classroomUnitId: z.ZodString;
}, z.core.$strip>;
export type AssignCRDto = z.infer<typeof AssignCRSchema>;
export type DemoteCRDto = z.infer<typeof DemoteCRSchema>;
//# sourceMappingURL=cr.schema.d.ts.map