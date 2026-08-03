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

  const res = await request<{ items: Resource[]; total?: number }>(`/api/v1/resources?${qs.toString()}`);
  return res;
}

export async function getMyUploads(page = 1, limit = 20): Promise<{ items: Resource[]; total?: number }> {
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getResourceById(id: string): Promise<Resource> {
  return request<Resource>(`/api/v1/resources/${id}`);
}
