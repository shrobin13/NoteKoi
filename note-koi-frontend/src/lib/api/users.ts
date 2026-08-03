import { request } from "./client";
import type { User } from "@/lib/types";

export function getCurrentUser(): Promise<User> {
  return request<User>("/api/v1/users/me");
}

export interface CrCoCrAssignment {
  id: string;
  userId: string;
  collegeId: string;
  departmentId: string;
  sessionId: string;
  type: "CR" | "CO_CR";
  isActive: boolean;
}

export function getUserAssignments(): Promise<CrCoCrAssignment[]> {
  return request<CrCoCrAssignment[]>("/api/v1/users/me/assignments");
}

export interface UpdateCurrentUserPayload {
  name?: string;
  email?: string;
  collegeId?: string;
  departmentId?: string;
}

export function updateCurrentUser(payload: UpdateCurrentUserPayload): Promise<User> {
  return request<User>("/api/v1/users/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
