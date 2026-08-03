import { prisma } from "../prisma/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export function createNotification(input: Prisma.NotificationCreateInput | { data: Prisma.NotificationCreateInput }) {
  const data = "data" in input ? input.data : input;
  return prisma.notification.create({ data });
}

export function findNotificationsByUser(userId: string, skip = 0, take = 20) {
  return prisma.$transaction(async (tx) => {
    const items = await tx.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    const total = await tx.notification.count({ where: { userId } });

    return { items, total };
  });
}

export function findNotificationById(id: string) {
  return prisma.notification.findUnique({ where: { id } });
}

export function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}
