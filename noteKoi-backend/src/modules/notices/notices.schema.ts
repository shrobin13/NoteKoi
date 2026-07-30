import { z } from "zod";

export const CreateNoticeSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  classroomUnitId: z.string().cuid(),
});

export const UpdateNoticeSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
});

export const NoticeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type CreateNoticeDto = z.infer<typeof CreateNoticeSchema>;
export type UpdateNoticeDto = z.infer<typeof UpdateNoticeSchema>;
export type NoticeQueryDto = z.infer<typeof NoticeQuerySchema>;
