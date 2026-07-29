import { z } from "zod";
import { CrSeat } from "../../../generated/prisma/index.js";

export const AssignCRSchema = z.object({
  userId: z.string().cuid(),
  classroomUnitId: z.string().cuid(),
  seat: z.nativeEnum(CrSeat),
});

export const DemoteCRSchema = z.object({
  userId: z.string().cuid(),
  classroomUnitId: z.string().cuid(),
});

export type AssignCRDto = z.infer<typeof AssignCRSchema>;
export type DemoteCRDto = z.infer<typeof DemoteCRSchema>;
