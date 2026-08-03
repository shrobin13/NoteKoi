import { request } from "./client";
import { Notification } from "@/lib/types";

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export async function getNotifications({ page = 1, limit = 20 }: GetNotificationsParams = {}): Promise<Notification[]> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request<Notification[]>(`/api/v1/notifications?${qs.toString()}`);
}

export async function markNotificationRead(id: string): Promise<void> {
  await request(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}
