import apiClient from "./api";
import type { AuthResponse, AuthTokens, User } from "./types";

function normalizeAuthResponse(payload: Partial<AuthResponse> & { accessToken?: string; refreshToken?: string }): AuthResponse {
  const accessToken = payload.tokens?.accessToken ?? payload.accessToken;
  const refreshToken = payload.tokens?.refreshToken ?? payload.refreshToken;
  const user = payload.user;

  if (!user || !accessToken || !refreshToken) {
    throw new Error("Invalid auth response from server");
  }

  return {
    user,
    tokens: { accessToken, refreshToken },
  };
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  collegeId: string;
  classroomUnitId: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/register", payload);
  const payloadBody = data?.data ?? data;
  return normalizeAuthResponse(payloadBody as Partial<AuthResponse> & { accessToken?: string; refreshToken?: string });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post("/api/auth/login", payload);
  const payloadBody = data?.data ?? data;
  return normalizeAuthResponse(payloadBody as Partial<AuthResponse> & { accessToken?: string; refreshToken?: string });
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
