import apiClient from "./api";
import type { AdminStats, User, CRMember, CrSeat } from "./types";

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await apiClient.get("/api/admin/stats");
  return data.data as AdminStats;
}

export async function getSubAdmins(): Promise<User[]> {
  const { data } = await apiClient.get("/api/admin/sub-admins");
  return data.data as User[];
}

export async function promoteSubAdmin(userId: string, collegeId: string): Promise<User> {
  const { data } = await apiClient.post("/api/admin/sub-admins", { userId, collegeId });
  return data.data as User;
}

export async function demoteSubAdmin(userId: string): Promise<void> {
  await apiClient.delete(`/api/admin/sub-admins/${userId}`);
}

export async function transferOwnership(newOwnerUserId: string): Promise<void> {
  await apiClient.post("/api/admin/transfer-ownership", { newOwnerUserId });
}

// ── CR Management ─────────────────────────────────────────────────────────
export async function getCRs(classroomUnitId: string): Promise<CRMember[]> {
  const { data } = await apiClient.get(`/api/cr/${classroomUnitId}`);
  return data.data as CRMember[];
}

export async function assignCR(payload: {
  userId: string;
  classroomUnitId: string;
  seat: CrSeat;
}) {
  const { data } = await apiClient.post("/api/cr/assign", payload);
  return data.data;
}

export async function demoteCR(payload: { userId: string; classroomUnitId: string }) {
  const { data } = await apiClient.delete("/api/cr/demote", { data: payload });
  return data.data;
}
