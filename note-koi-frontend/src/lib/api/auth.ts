import { request } from "./client";
import type { User } from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterStudentPayload {
  name?: string;
  email: string;
  password: string;
  collegeId: string;
  departmentId: string;
  sessionId: string;
  regNo: string;
}

export interface RegisterTeacherPayload {
  name?: string;
  email: string;
  password: string;
  collegeId: string;
  departmentIds: string[];
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export async function login(payload: LoginPayload): Promise<User> {
  return request<User>("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function registerStudent(payload: RegisterStudentPayload): Promise<User> {
  return request<User>("/api/v1/auth/register/student", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function registerTeacher(payload: RegisterTeacherPayload): Promise<User> {
  return request<User>("/api/v1/auth/register/teacher", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
  await request<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await request<void>("/api/v1/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<void> {
  await request<void>("/api/v1/auth/logout", {
    method: "POST",
  });
}
