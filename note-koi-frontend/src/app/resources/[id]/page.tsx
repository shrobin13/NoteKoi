"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useResourceQuery } from "@/hooks/useResourceQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import {
  useRequestDeletionMutation,
  useRecommendPromotionMutation,
} from "@/hooks/useResourceActionMutations";
import { ResourceCard } from "@/components/shared/resource-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { ReportDialog } from "@/components/features/resources/report-dialog";

interface ResourcePageProps {
  params: {
    id: string;
  };
}

/**
 * Resource Detail Page — Milestone 3 task 4 / wireframe B.10
 * Contextual actions toolbar per Figma/Apple principle 3:
 * - Edit (if owner/uploader)
 * - Report (all users)
 * - Version History (all users)
 * - Recommend for Platform (if eligible CR + APPROVED COLLEGE resource)
 * - Request Deletion (if owner + APPROVED resource)
 */
export default function ResourcePage({ params }: ResourcePageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: resource, isLoading, error } = useResourceQuery(id);
  const { data: user } = useUsersQuery();

  const [showReportModal, setShowReportModal] = useState(false);
  const [recommendSuccess, setRecommendSuccess] = useState(false);
  const [requestDelSuccess, setRequestDelSuccess] = useState(false);

  const requestDelMutation = useRequestDeletionMutation();
  const recommendMutation = useRecommendPromotionMutation();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Loading resource</h1>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-3xl border border-slate-800/80 bg-slate-900/80 animate-pulse" />
          <div className="h-64 rounded-3xl border border-slate-800/80 bg-slate-900/80 animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !resource) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <EmptyStateBlock
          title="Resource not found"
          description="We couldn’t find that resource. It may have been removed or the link is incorrect."
          actionText="Back to Discover"
          actionHref="/"
        />
      </section>
    );
  }

  const isOwner = user?.id === resource.uploader.id;
  const isCR = user?.role === "CR" || user?.role === "CO_CR";
  const canRecommend = isCR && resource.visibility === "COLLEGE" && resource.state === "APPROVED";
  const canRequestDeletion = isOwner && resource.state === "APPROVED";

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{resource.title}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">{resource.description}</p>
        </div>

        {/* Contextual Actions Toolbar — Milestone 3 task 4 & wireframe §1 principle 3 */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 shadow-lg">
          <Link href={`/resources/${id}/versions`}>
            <Button variant="ghost" className="text-xs text-slate-300 hover:text-white">
              📜 Version History
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="text-xs text-slate-300 hover:text-white"
            onClick={() => setShowReportModal(true)}
          >
            🚩 Report
          </Button>

          {isOwner && (
            <Link href={`/upload?editId=${id}`}>
              <Button variant="secondary" className="text-xs">
                ✏️ Edit Metadata
              </Button>
            </Link>
          )}

          {canRecommend && (
            <Button
              variant="secondary"
              className="text-xs text-violet-300 border-violet-700/50 hover:bg-violet-900/40"
              disabled={recommendMutation.isPending || recommendSuccess}
              onClick={() => {
                recommendMutation.mutate(id, { onSuccess: () => setRecommendSuccess(true) });
              }}
            >
              {recommendSuccess ? "✓ Recommended" : "⭐ Recommend for Platform"}
            </Button>
          )}

          {canRequestDeletion && (
            <Button
              variant="destructive"
              className="text-xs"
              disabled={requestDelMutation.isPending || requestDelSuccess}
              onClick={() => {
                requestDelMutation.mutate(id, { onSuccess: () => setRequestDelSuccess(true) });
              }}
            >
              {requestDelSuccess ? "Deletion Requested" : "🗑️ Request Deletion"}
            </Button>
          )}
        </div>
      </div>

      {recommendSuccess && (
        <div className="mb-6 rounded-2xl border border-violet-700/60 bg-violet-900/20 px-4 py-3 text-sm text-violet-300">
          This resource has been recommended for platform-wide promotion.
        </div>
      )}

      {requestDelSuccess && (
        <div className="mb-6 rounded-2xl border border-orange-700/60 bg-orange-900/20 px-4 py-3 text-sm text-orange-300">
          Deletion requested. Your request is pending moderator review.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource details</p>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Type</span>
                <span className="font-semibold text-white">{resource.type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Visibility</span>
                <span className="font-semibold text-white">{resource.visibility === "PLATFORM" ? "Platform" : "College"}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>State</span>
                <span className="font-semibold text-white">{resource.state.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Version</span>
                <span className="font-semibold text-white">v{resource.version ?? 1}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Uploaded by</span>
                <span className="font-semibold text-white">{resource.uploader.name ?? resource.uploader.id}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Created</span>
                <span className="font-semibold text-white">{new Date(resource.createdAt).toLocaleDateString()}</span>
              </div>
              {resource.tags?.length ? (
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <span className="text-sm text-slate-400">Tags</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {resource.fileUrl ? (
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <span className="text-sm text-slate-400">File</span>
                  <div className="mt-2">
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                    >
                      Download file
                    </a>
                  </div>
                </div>
              ) : null}
              {resource.youtubeUrl ? (
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <span className="text-sm text-slate-400">YouTube</span>
                  <div className="mt-2">
                    <a
                      href={resource.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </Card>

        <div className="space-y-6">
          <ResourceCard {...resource} />
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
