import apiClient from "./api";
import type { PersonalShare, PaginatedResponse } from "./types";

export async function getMyShares(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<PersonalShare>> {
  const { data } = await apiClient.get("/api/shares", { params: { page, limit } });
  return data.data as PaginatedResponse<PersonalShare>;
}

export async function createShare(payload: {
  content: string;
  classroomUnitId: string;
  recipientIds: string[];
}): Promise<PersonalShare> {
  const { data } = await apiClient.post("/api/shares", payload);
  return data.data as PersonalShare;
}
