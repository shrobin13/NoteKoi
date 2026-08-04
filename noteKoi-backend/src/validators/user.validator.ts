import { z } from "zod";

export const studentRegistrationSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  collegeId: z.string().min(1),
  departmentId: z.string().min(1),
  sessionId: z.string().min(1),
  regNo: z.string().min(1),
});

export const teacherRegistrationSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  collegeId: z.string().min(1),
  departmentIds: z.array(z.string().min(1)).min(1),
});
