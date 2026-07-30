import apiClient from "./api";
import type { Notice, PaginatedResponse } from "./types";

export async function getNotices(
  classroomUnitId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Notice>> {
  const { data } = await apiClient.get(`/api/notices/unit/${classroomUnitId}`, {
    params: { page, limit },
  });
  return data.data as PaginatedResponse<Notice>;
}

export async function createNotice(payload: {
  title: string;
  content: string;
  classroomUnitId: string;
}): Promise<Notice> {
  const { data } = await apiClient.post("/api/notices", payload);
  return data.data as Notice;
}

export async function updateNotice(
  id: string,
  payload: { title?: string; content?: string }
): Promise<Notice> {
  const { data } = await apiClient.patch(`/api/notices/${id}`, payload);
  return data.data as Notice;
}

export async function deleteNotice(id: string): Promise<void> {
  await apiClient.delete(`/api/notices/${id}`);
}
