import { request } from "./client";
import type { Resource } from "@/lib/types";

// ─── Moderation Queues (Milestone 5 & 6 / wirefram-resolution.md §4 B.16–B.19) ───

export interface QueueItem {
  id: string;
  title: string;
  type: string;
  state: string;
  deletionFlag: boolean;
  createdAt: string;
  uploader: { id: string; name?: string };
}

export interface CRQueueResponse {
  items: QueueItem[];
  total?: number;
  scope?: { department: string; session: string };
}

/** GET /cr/queue — CR/Co-CR moderation queue (wirefram-resolution §4 B.16) */
export async function getCRQueue(page = 1): Promise<CRQueueResponse> {
  return request<CRQueueResponse>(`/api/v1/cr/queue?page=${page}`);
}

/** GET /sub-admin/queue — Sub Admin moderation queue (wirefram-resolution §4 B.18) */
export async function getSubAdminQueue(page = 1, tab?: string): Promise<CRQueueResponse> {
  const qs = new URLSearchParams({ page: String(page) });
  if (tab) qs.set("tab", tab);
  return request<CRQueueResponse>(`/api/v1/sub-admin/queue?${qs.toString()}`);
}

// ─── Student Verifications (Milestone 5 / §4 B.17) ───

export interface PendingStudent {
  userId: string;
  name?: string;
  regNo: string;
  college?: string;
  email?: string;
  createdAt: string;
}

/** GET /cr/student-verifications */
export async function getCRStudentVerifications(): Promise<PendingStudent[]> {
  return request<PendingStudent[]>("/api/v1/cr/student-verifications");
}

/** GET /sub-admin/student-verifications (fallback per §4 B.17) */
export async function getSubAdminStudentVerifications(): Promise<PendingStudent[]> {
  return request<PendingStudent[]>("/api/v1/sub-admin/student-verifications");
}

/** POST /student-verifications/:userId/approve */
export async function approveStudentVerification(userId: string): Promise<void> {
  await request<void>(`/api/v1/student-verifications/${userId}/approve`, { method: "POST" });
}

// ─── Teacher Verifications (Milestone 6 / §4 B.19) ───

export interface PendingTeacher {
  userId: string;
  name?: string;
  email?: string;
  college?: string;
  departments?: string[];
  createdAt: string;
}

/** GET /sub-admin/teacher-verifications */
export async function getTeacherVerifications(): Promise<PendingTeacher[]> {
  return request<PendingTeacher[]>("/api/v1/sub-admin/teacher-verifications");
}

/** POST /sub-admin/teacher-verifications/:userId/approve */
export async function approveTeacherVerification(userId: string): Promise<void> {
  await request<void>(`/api/v1/sub-admin/teacher-verifications/${userId}/approve`, { method: "POST" });
}

// ─── CR/Co-CR Assignments (Milestone 6 / §4 B.21) ───

export interface CRAssignment {
  id: string;
  userId: string;
  name?: string;
  role: "CR" | "CO_CR";
  departmentId: string;
  sessionId: string;
  assignedAt: string;
}

/** POST /sub-admin/cr-assignments */
export async function appointCR(payload: {
  userId: string;
  role: "CR" | "CO_CR";
  departmentId: string;
  sessionId: string;
}): Promise<CRAssignment> {
  return request<CRAssignment>("/api/v1/sub-admin/cr-assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** POST /sub-admin/cr-assignments/:id/revoke */
export async function revokeCR(id: string): Promise<void> {
  await request<void>(`/api/v1/sub-admin/cr-assignments/${id}/revoke`, { method: "POST" });
}

// ─── Sub Admin Management (Milestone 7 / §4 B.24) ───

export interface SubAdminAssignment {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  collegeId: string;
  assignedAt: string;
}

/** POST /platform-admin/sub-admins */
export async function appointSubAdmin(payload: { userId: string; collegeId: string }): Promise<SubAdminAssignment> {
  return request<SubAdminAssignment>("/api/v1/platform-admin/sub-admins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** POST /platform-admin/sub-admins/:id/revoke */
export async function revokeSubAdmin(id: string): Promise<void> {
  await request<void>(`/api/v1/platform-admin/sub-admins/${id}/revoke`, { method: "POST" });
}

// ─── Emergency Appointment (Milestone 7 / §4 B.25) ───

export interface EmergencyAppointmentPayload {
  userId: string;
  role: "SUB_ADMIN" | "CR" | "CO_CR";
  collegeId?: string;
  departmentId?: string;
  sessionId?: string;
  justification: string;
}

/** POST /platform-admin/emergency-appointments */
export async function createEmergencyAppointment(payload: EmergencyAppointmentPayload): Promise<void> {
  await request<void>("/api/v1/platform-admin/emergency-appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ─── CRUD Override (Milestone 7 / §4 B.26) ───

export interface CRUDOverridePayload {
  resourceId: string;
  action: "APPROVE" | "REJECT" | "DELETE" | "RESTORE";
  justification: string;
}

/** POST /platform-admin/resources/:id/override */
export async function crudOverride(resourceId: string, payload: { action: string; justification: string }): Promise<Resource> {
  return request<Resource>(`/api/v1/platform-admin/resources/${resourceId}/override`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ─── Promotion Override (Milestone 7 / §4 B.26) ───

export interface PromotionOverridePayload {
  resourceId: string;
  action: "APPROVE" | "DENY";
  justification: string;
}

/** POST /platform-admin/promotion-override */
export async function promotionOverride(payload: PromotionOverridePayload): Promise<void> {
  await request<void>("/api/v1/platform-admin/promotion-override", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ─── Analytics (Milestone 6 & 7 / §4 B.22, B.26) ───

export interface ContentGap { departmentId: string; name: string; resourceCount: number }
export interface DedupSaving { saved: number; totalChecked: number }
export interface CRThroughput { crId: string; name?: string; approved: number; rejected: number }
export interface OverrideLog {
  id: string;
  actor: string;
  target: string;
  action: string;
  timestamp: string;
  justification: string;
}
export interface PromotionByCollege { collegeId: string; name: string; count: number }

/** GET /analytics/content-gaps */
export async function getContentGaps(): Promise<ContentGap[]> {
  return request<ContentGap[]>("/api/v1/analytics/content-gaps");
}

/** GET /analytics/dedup-savings */
export async function getDedupSavings(): Promise<DedupSaving> {
  return request<DedupSaving>("/api/v1/analytics/dedup-savings");
}

/** GET /sub-admin/analytics/cr-throughput */
export async function getCRThroughput(): Promise<CRThroughput[]> {
  return request<CRThroughput[]>("/api/v1/sub-admin/analytics/cr-throughput");
}

/** GET /platform-admin/analytics/override-logs */
export async function getOverrideLogs(): Promise<OverrideLog[]> {
  return request<OverrideLog[]>("/api/v1/platform-admin/analytics/override-logs");
}

/** GET /platform-admin/analytics/promotions-by-college */
export async function getPromotionsByCollege(): Promise<PromotionByCollege[]> {
  return request<PromotionByCollege[]>("/api/v1/platform-admin/analytics/promotions-by-college");
}
