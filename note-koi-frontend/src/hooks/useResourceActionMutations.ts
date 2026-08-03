"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reportResource,
  selfCancelResource,
  flagDeletion,
  requestDeletion,
  recommendPromotion,
  promoteResource,
  openReview,
  approveResource,
  rejectResource,
  deletionDecision,
  resubmitResource,
  type ReportReason,
} from "@/lib/api/resources";

/**
 * Consolidates all per-resource action mutations.
 * Per wirefram-resolution.md §4 B.10/B.13/B.16.
 */

export function useReportResourceMutation(resourceId: string) {
  return useMutation({
    mutationFn: (reason: ReportReason) => reportResource(resourceId, reason),
  });
}

export function useSelfCancelMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => selfCancelResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", "my-uploads"] }),
  });
}

export function useFlagDeletionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flagDeletion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", "my-uploads"] }),
  });
}

export function useRequestDeletionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestDeletion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", "my-uploads"] }),
  });
}

export function useRecommendPromotionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recommendPromotion(id),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: ["resources", id] }),
  });
}

export function usePromoteResourceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promoteResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sub-admin-queue"] }),
  });
}

export function useOpenReviewMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => openReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cr-queue"] });
      qc.invalidateQueries({ queryKey: ["sub-admin-queue"] });
    },
  });
}

export function useApproveResourceMutation(queueKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
}

export function useRejectResourceMutation(queueKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectResource(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
}

export function useDeletionDecisionMutation(queueKey: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => deletionDecision(id, approve),
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
}

export function useResubmitMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resubmitResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resources", "my-uploads"] }),
  });
}
