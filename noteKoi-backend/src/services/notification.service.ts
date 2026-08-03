import { AppError } from "../errors/app.error.js";
import { findNotificationById, findNotificationsByUser, markNotificationRead } from "../repositories/notification.repository.js";

export async function listNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const { items, total } = await findNotificationsByUser(userId, skip, limit);
  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  const notification = await findNotificationById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404, "NOT_FOUND");
  }
  if (notification.userId !== userId) {
    throw new AppError("Forbidden", 403, "FORBIDDEN");
  }
  return markNotificationRead(notificationId);
}
