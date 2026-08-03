import { request } from "./client";
import type { Department } from "@/lib/types";

export async function getDepartments(): Promise<Department[]> {
  return request<Department[]>("/api/v1/departments");
}

export interface CreateDepartmentPayload {
  name: string;
}

export async function createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
  return request<Department>("/api/v1/departments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export interface UpdateDepartmentPayload {
  name?: string;
}

export async function updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<Department> {
  return request<Department>(`/api/v1/departments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
