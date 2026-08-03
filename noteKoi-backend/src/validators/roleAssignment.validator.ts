import { z } from "zod";

export const subAdminAssignmentSchema = z.object({
  userId: z.string().min(1),
  collegeId: z.string().min(1),
});

export const crCoCrAssignmentSchema = z.object({
  userId: z.string().min(1),
  collegeId: z.string().min(1),
  departmentId: z.string().min(1),
  sessionId: z.string().min(1),
  type: z.enum(["CR", "CO_CR"]),
});
