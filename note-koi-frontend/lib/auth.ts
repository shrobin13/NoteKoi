import apiClient from "./api";
import type { AuthResponse, AuthTokens, User } from "./types";

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  collegeId: string;
  classroomUnitId: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/register", payload);
  return data.data as AuthResponse;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/login", payload);
  return data.data as AuthResponse;
}

export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await apiClient.post("/api/auth/refresh", { refreshToken });
  return data.data as AuthTokens;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get("/api/users/me");
  return data.data as User;
}

export async function updateMe(payload: { name?: string }): Promise<User> {
  const { data } = await apiClient.patch("/api/users/me", payload);
  return data.data as User;
}

export async function getUserById(userId: string): Promise<User> {
  const { data } = await apiClient.get(`/api/users/${userId}`);
  return data.data as User;
}
