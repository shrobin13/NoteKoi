import { z } from "zod";

export const CreateShareSchema = z.object({
  content: z.string().min(1).max(5000),
  classroomUnitId: z.string().cuid(),
  recipientIds: z.array(z.string().cuid()).min(1),
});

export const ShareQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type CreateShareDto = z.infer<typeof CreateShareSchema>;
export type ShareQueryDto = z.infer<typeof ShareQuerySchema>;
