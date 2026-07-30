import { z } from "zod";

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(255),
  classroomUnitId: z.string().cuid(),
  courseId: z.string().cuid().optional(),
});

export const AddMemberSchema = z.object({
  userId: z.string().cuid(),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const MessageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
export type AddMemberDto = z.infer<typeof AddMemberSchema>;
export type SendMessageDto = z.infer<typeof SendMessageSchema>;
export type MessageQueryDto = z.infer<typeof MessageQuerySchema>;
