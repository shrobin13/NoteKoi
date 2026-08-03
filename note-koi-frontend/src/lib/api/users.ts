import { request } from "./client";
import type { User } from "@/lib/types";

export function getCurrentUser(): Promise<User> {
  return request<User>("/api/v1/users/me");
}

export interface UpdateCurrentUserPayload {
  name?: string;
  email?: string;
  collegeId?: string;
  departmentId?: string;
}

export function updateCurrentUser(payload: UpdateCurrentUserPayload): Promise<User> {
  return request<User>("/api/v1/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
