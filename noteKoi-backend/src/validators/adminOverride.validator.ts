import { z } from "zod";

export const overridePromotionSchema = z.object({
  action: z.enum(["APPROVE_RECOMMENDATION", "DENY_RECOMMENDATION", "PROMOTE_RESOURCE"]),
  targetId: z.string().min(1),
  justificationNote: z.string().trim().min(1).max(2000),
  reason: z.string().trim().max(1000).optional().nullable(),
});

export const emergencyAppointmentSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(["SUB_ADMIN", "CR", "CO_CR"]),
  scope: z.object({
    collegeId: z.string().min(1).optional(),
    departmentId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
  }).optional(),
  justificationNote: z.string().trim().min(1).max(2000),
});

export const resourceOverrideSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "DELETE"]),
  justificationNote: z.string().trim().min(1).max(2000),
});
