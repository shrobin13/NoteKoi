import { prisma } from "../prisma/prisma.js";
import { $Enums } from "../../generated/prisma/client.js";

export function createAdminOverrideLog(data: {
  actorId: string;
  overrideType: $Enums.OverrideType;
  targetType: string;
  targetId: string;
  action: string;
  justificationNote: string;
}) {
  return prisma.adminOverrideLog.create({ data });
}
