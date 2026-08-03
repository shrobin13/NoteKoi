import { request } from "./client";
import type { Session } from "@/lib/types";

export async function getSessionsByDepartment(departmentId: string): Promise<Session[]> {
  return request<Session[]>(`/api/v1/departments/${departmentId}/sessions`);
}

export interface CreateSessionPayload {
  departmentId: string;
  label: string;
  isOpen?: boolean;
}

export async function createSession(departmentId: string, payload: CreateSessionPayload): Promise<Session> {
  return request<Session>(`/api/v1/departments/${departmentId}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export interface UpdateSessionPayload {
  label?: string;
  isOpen?: boolean;
}

export async function updateSession(id: string, payload: UpdateSessionPayload): Promise<Session> {
  return request<Session>(`/api/v1/sessions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
