import { z } from "zod";

export const AssignSubAdminSchema = z.object({
  userId: z.string().cuid(),
  collegeId: z.string().cuid(),
});

export const DemoteSubAdminSchema = z.object({
  userId: z.string().cuid(),
});

export const TransferOwnershipSchema = z.object({
  newOwnerUserId: z.string().cuid(),
});

export type AssignSubAdminDto = z.infer<typeof AssignSubAdminSchema>;
export type DemoteSubAdminDto = z.infer<typeof DemoteSubAdminSchema>;
export type TransferOwnershipDto = z.infer<typeof TransferOwnershipSchema>;
