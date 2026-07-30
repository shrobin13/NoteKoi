import apiClient from "./api";
import type { VerificationRequest, PaginatedResponse } from "./types";

export async function requestVerification(classroomUnitId: string): Promise<VerificationRequest> {
  const { data } = await apiClient.post("/api/verification/request", { classroomUnitId });
  return data.data as VerificationRequest;
}

export async function getPendingVerifications(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<VerificationRequest>> {
  const { data } = await apiClient.get("/api/verification/pending", { params: { page, limit } });
  return data.data as PaginatedResponse<VerificationRequest>;
}

export async function approveVerification(requestId: string): Promise<VerificationRequest> {
  const { data } = await apiClient.post(`/api/verification/approve/${requestId}`);
  return data.data as VerificationRequest;
}

export async function rejectVerification(requestId: string): Promise<VerificationRequest> {
  const { data } = await apiClient.post(`/api/verification/reject/${requestId}`);
  return data.data as VerificationRequest;
}
