import apiClient from "./api";
import type { Resource, ResourceCategory, Visibility, PaginatedResponse } from "./types";

export interface ResourceQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: ResourceCategory;
  courseId?: string;
  departmentId?: string;
}

export async function getPublicResources(query: ResourceQuery = {}): Promise<PaginatedResponse<Resource>> {
  const { data } = await apiClient.get("/api/resources/public", { params: query });
  return data.data as PaginatedResponse<Resource>;
}

export async function getUnitResources(
  classroomUnitId: string,
  query: ResourceQuery = {}
): Promise<PaginatedResponse<Resource>> {
  const { data } = await apiClient.get(`/api/resources/unit/${classroomUnitId}`, {
    params: query,
  });
  return data.data as PaginatedResponse<Resource>;
}

export async function getResource(id: string): Promise<Resource> {
  const { data } = await apiClient.get(`/api/resources/${id}`);
  return data.data as Resource;
}

export interface CreateResourcePayload {
  title: string;
  category: ResourceCategory;
  visibility: Visibility;
  fileId: string;
  fileUrl: string;
  previewUrl?: string;
  courseId?: string;
  classroomUnitId: string;
}

export async function createResource(payload: CreateResourcePayload): Promise<Resource> {
  const { data } = await apiClient.post("/api/resources", payload);
  return data.data as Resource;
}

export interface UpdateResourcePayload {
  title?: string;
  category?: ResourceCategory;
  visibility?: Visibility;
  fileId?: string;
  fileUrl?: string;
  previewUrl?: string;
  courseId?: string | null;
}

export async function updateResource(id: string, payload: UpdateResourcePayload): Promise<Resource> {
  const { data } = await apiClient.patch(`/api/resources/${id}`, payload);
  return data.data as Resource;
}

export async function deleteResource(id: string): Promise<void> {
  await apiClient.delete(`/api/resources/${id}`);
}
