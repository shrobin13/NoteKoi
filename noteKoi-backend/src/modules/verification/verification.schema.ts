import { z } from "zod";

export const RequestVerificationSchema = z.object({
  classroomUnitId: z.string().cuid(),
});

export const ApproveVerificationSchema = z.object({
  requestId: z.string().cuid(),
});

export type RequestVerificationDto = z.infer<typeof RequestVerificationSchema>;
