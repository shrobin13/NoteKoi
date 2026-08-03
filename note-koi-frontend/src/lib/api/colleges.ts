import { request } from "./client";
import type { College, Department } from "@/lib/types";

export async function getColleges(): Promise<College[]> {
  return request<College[]>("/api/v1/colleges");
}

export interface CreateCollegePayload {
  name: string;
  isActive?: boolean;
}

export async function createCollege(payload: CreateCollegePayload): Promise<College> {
  return request<College>("/api/v1/colleges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export interface UpdateCollegePayload {
  name?: string;
  isActive?: boolean;
}

export async function updateCollege(id: string, payload: UpdateCollegePayload): Promise<College> {
  return request<College>(`/api/v1/colleges/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getCollegeDepartments(collegeId: string): Promise<Department[]> {
  return request<Department[]>(`/api/v1/colleges/${collegeId}/departments`);
}

export interface AdoptDepartmentPayload {
  departmentId: string;
}

export async function adoptDepartment(collegeId: string, payload: AdoptDepartmentPayload): Promise<void> {
  await request<void>(`/api/v1/colleges/${collegeId}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function revokeDepartment(collegeId: string, departmentId: string): Promise<void> {
  await request<void>(`/api/v1/colleges/${collegeId}/departments/${departmentId}`, {
    method: "DELETE",
  });
}
