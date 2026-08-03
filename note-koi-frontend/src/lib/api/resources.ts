import { request } from "./client";
import { Resource } from "@/lib/types";

export interface GetResourcesParams {
  page?: number;
  limit?: number;
  q?: string;
  resourceType?: string;
  sessionId?: string;
  visibility?: string;
  includeOtherColleges?: boolean;
  courseId?: string;
}

export interface UploadResourceFileResponse {
  fileUrl?: string;
  contentHash?: string;
}

export async function getResources(params: GetResourcesParams = {}): Promise<{ items: Resource[]; total?: number }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.q) qs.set("q", params.q);
  if (params.resourceType) qs.set("resourceType", params.resourceType);
  if (params.sessionId) qs.set("sessionId", params.sessionId);
  if (params.visibility) qs.set("visibility", params.visibility);
  if (params.includeOtherColleges) qs.set("includeOtherColleges", String(params.includeOtherColleges));
  if (params.courseId) qs.set("courseId", params.courseId);

  return request<{ items: Resource[]; total?: number }>(`/api/v1/resources?${qs.toString()}`);
}

export async function getMyUploads(page = 1, limit = 100): Promise<{ items: Resource[]; total?: number }> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  return request<{ items: Resource[]; total?: number }>(`/api/v1/resources/my-uploads?${qs.toString()}`);
}

export async function uploadResourceFile(file: File): Promise<UploadResourceFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request<UploadResourceFileResponse>("/api/v1/resources/upload", {
    method: "POST",
    body: formData,
  });
}

export interface CreateResourcePayload {
  uploaderId: string;
  uploaderRoleSnapshot: "STUDENT" | "TEACHER" | "SUB_ADMIN" | "PLATFORM_ADMIN";
  resourceType: Resource["type"];
  title: string;
  description?: string | null;
  tags?: string[];
  courseId: string;
  departmentId: string;
  sessionId?: string;
  visibility: Resource["visibility"];
  collegeId?: string;
  fileUrl?: string;
  youtubeUrl?: string;
  contentHash?: string;
}

export async function createResource(payload: CreateResourcePayload): Promise<Resource> {
  return request<Resource>("/api/v1/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getResourceById(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}`);
}

// ─── Version History (wirefram-resolution.md §4, B.11) ───
export interface ResourceVersion {
  id: string;
  version: number;
  title: string;
  state: Resource["state"];
  createdAt: string;
  uploader: { id: string; name?: string; role: string };
  fileUrl?: string;
  youtubeUrl?: string;
}

export async function getResourceVersions(rootId: string): Promise<ResourceVersion[]> {
  return request<ResourceVersion[]>(`/api/v1/resources/${rootId}/versions`);
}

export async function addResourceVersion(id: string, file: File): Promise<Resource> {
  const formData = new FormData();
  formData.append("file", file);
  return request<Resource>(`/api/v1/resources/${id}/versions`, {
    method: "POST",
    body: formData,
  });
}

// ─── Report (Milestone 3 task 6 / §4 B.10) ───
export type ReportReason = "INCORRECT" | "SPAM" | "PLAGIARISED";

export async function reportResource(id: string, reason: ReportReason): Promise<void> {
  await request<void>(`/api/v1/resources/${id}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

// ─── Self-service state actions (Milestone 4 task 2 / §4 B.13) ───
export async function selfCancelResource(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/self-cancel`, { method: "POST" });
}

export async function flagDeletion(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/flag-deletion`, { method: "POST" });
}

export async function requestDeletion(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/request-deletion`, { method: "POST" });
}

export async function resubmitResource(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/resubmit`, { method: "POST" });
}

// ─── Metadata editing (Milestone 4 task 3 / §4 B.10) ───
export interface MetadataPayload {
  title?: string;
  description?: string;
  tags?: string[];
}

export async function patchMetadata(id: string, payload: MetadataPayload): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/metadata`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export interface ReassignPayload {
  courseId?: string;
  departmentId?: string;
  sessionId?: string;
}

export async function reassignResource(id: string, payload: ReassignPayload): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/reassign`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ─── Promotion (Milestone 5 task 4 / §4 B.10) ───
export async function recommendPromotion(id: string): Promise<void> {
  await request<void>(`/api/v1/resources/${id}/recommend-promotion`, { method: "POST" });
}

export async function promoteResource(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/promote`, { method: "POST" });
}

// ─── Moderation queue actions (Milestone 5 task 3 / §4 B.16) ───
export async function openReview(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/open-review`, { method: "POST" });
}

export async function approveResource(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/approve`, { method: "POST" });
}

export async function rejectResource(id: string, reason: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export async function deletionDecision(id: string, approve: boolean): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}/deletion-decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approve }),
  });
}
