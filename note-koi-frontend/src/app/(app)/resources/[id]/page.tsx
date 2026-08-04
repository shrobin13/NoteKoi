"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useResourceQuery } from "@/hooks/useResourceQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import {
  useRequestDeletionMutation,
  useRecommendPromotionMutation,
} from "@/hooks/useResourceActionMutations";
import { ResourceCard } from "@/components/shared/resource-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { ReportDialog } from "@/components/features/resources/report-dialog";
import { getUserAssignments } from "@/lib/api/users";

interface ResourcePageProps {
  params: { id: string };
}

const STATE_TONE: Record<string, string> = {
  PENDING: "pending",
  IN_REVIEW: "review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUPERSEDED: "superseded",
  DELETION_REQUESTED: "deletion",
  DELETED: "deleted",
};

export default function ResourcePage({ params }: ResourcePageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: resource, isLoading, error } = useResourceQuery(id);
  const { data: user } = useUsersQuery();
  const { data: assignments } = useQuery({
    queryKey: ["users", "me", "assignments"],
    queryFn: getUserAssignments,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [recommendSuccess, setRecommendSuccess] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [requestDelSuccess, setRequestDelSuccess] = useState(false);

  const requestDelMutation = useRequestDeletionMutation();
  const recommendMutation = useRecommendPromotionMutation();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-4xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-[8px] bg-[var(--ph)]" />
        <div className="h-64 animate-pulse rounded-[16px] border border-[var(--line-soft)] bg-[var(--ph)]" />
      </section>
    );
  }

  if (error || !resource) {
    return (
      <section className="mx-auto max-w-4xl">
        <EmptyStateBlock
          title="Resource not found"
          description="We couldn't find that resource. It may have been removed or the link is incorrect."
          actionText="Back to Discover"
          actionHref="/"
        />
      </section>
    );
  }

  const isOwner = user?.id === resource.uploader?.id;
  // CRs are STUDENT role with an active CrCoCrAssignment. Backend validates scope on the actual call.
  const hasActiveCrAssignment = assignments?.some((a) => a.isActive) ?? false;
  const canRecommend = hasActiveCrAssignment && resource.visibility === "COLLEGE" && resource.state === "APPROVED";
  const canRequestDeletion = isOwner && resource.state === "APPROVED";

  return (
    <section className="mx-auto max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Resource</p>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">{resource.title}</h1>
          {resource.description && (
            <p className="text-[12.5px] text-[var(--ink-soft)]">{resource.description}</p>
          )}
        </div>
      </div>

      {/* Action toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-2.5">
        <Button variant="ghost" className="text-[11px] py-1 px-3" onClick={() => router.back()}>← Back</Button>

        <Link href={`/resources/${id}/versions`}>
          <Button variant="ghost" className="text-[11px] py-1 px-3">Version History</Button>
        </Link>

        <Button
          variant="ghost"
          className="text-[11px] py-1 px-3"
          onClick={() => setShowReportModal(true)}
        >
          Report
        </Button>

        {isOwner && (
          <Link href={`/upload?editId=${id}`}>
            <Button variant="secondary" className="text-[11px] py-1 px-3">Edit Metadata</Button>
          </Link>
        )}

        {canRecommend && (
          <Button
            variant="secondary"
            className="text-[11px] py-1 px-3"
            disabled={recommendMutation.isPending || recommendSuccess}
            onClick={() =>
              recommendMutation.mutate(id, {
                onSuccess: () => { setRecommendSuccess(true); setRecommendError(null); },
                onError: (err) => setRecommendError(err instanceof Error ? err.message : "Failed to recommend."),
              })
            }
          >
            {recommendSuccess ? "Recommended ✓" : "Recommend for Platform"}
          </Button>
        )}

        {canRequestDeletion && (
          <Button
            variant="destructive"
            className="text-[11px] py-1 px-3"
            disabled={requestDelMutation.isPending || requestDelSuccess}
            onClick={() => requestDelMutation.mutate(id, { onSuccess: () => setRequestDelSuccess(true) })}
          >
            {requestDelSuccess ? "Deletion Requested" : "Request Deletion"}
          </Button>
        )}
      </div>

      {recommendSuccess && (
        <div className="rounded-[8px] border border-[#7c3aed]/40 bg-[#f0eaff] px-4 py-2.5 text-[12px] text-[#7c3aed]">
          This resource has been recommended for platform-wide promotion.
        </div>
      )}
      {recommendError && (
        <div className="rounded-[8px] border border-[#d24545]/40 bg-[#fbe6e6] px-4 py-2.5 text-[12px] text-[#d24545]">
          {recommendError}
        </div>
      )}

      {requestDelSuccess && (
        <div className="rounded-[8px] border border-[#c9973b]/40 bg-[#f6ecd8] px-4 py-2.5 text-[12px] text-[#c9973b]">
          Deletion requested. Pending moderator review.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Details card */}
        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-5 space-y-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Details</p>

          <div className="rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] divide-y divide-[var(--line-soft)]">
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Type</span>
              <span className="font-semibold text-[var(--ink)]">{(resource.type ?? resource.resourceType ?? "").replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Visibility</span>
              <Badge tone={resource.visibility === "PLATFORM" ? "platform" : "college"}>
                {resource.visibility === "PLATFORM" ? "Platform" : "College"}
              </Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">State</span>
              <Badge tone={STATE_TONE[resource.state] ?? "slate"}>{resource.state.replace(/_/g, " ")}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Version</span>
              <span className="font-semibold text-[var(--ink)]">v{resource.versionNumber ?? 1}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Uploaded by</span>
              <span className="font-semibold text-[var(--ink)]">{resource.uploader?.name ?? resource.uploader?.email ?? "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Created</span>
              <span className="font-semibold text-[var(--ink)]">{new Date(resource.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {resource.tags?.length ? (
            <div className="space-y-2">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag) => (
                  <span key={tag} className="rounded-[20px] bg-[var(--ph)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--ink-soft)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {(resource.fileUrl || resource.youtubeUrl) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {resource.fileUrl && (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[12px] font-semibold text-[#3f6fd6] hover:bg-[var(--ph)] transition"
                >
                  Download file
                </a>
              )}
              {resource.youtubeUrl && (
                <a
                  href={resource.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-[12px] font-semibold text-[#d24545] hover:bg-[var(--ph)] transition"
                >
                  Watch on YouTube
                </a>
              )}
            </div>
          )}
        </div>

        {/* Preview card */}
        <div>
          <ResourceCard {...resource} showState />
        </div>
      </div>

      <ReportDialog
        open={showReportModal}
        resourceId={id}
        onClose={() => setShowReportModal(false)}
      />
    </section>
  );
}
