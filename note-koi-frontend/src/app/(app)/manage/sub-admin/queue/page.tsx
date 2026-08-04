"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubAdminQueue,
  approveRecommendation,
  denyRecommendation,
  type QueueItem,
  type PromotionRecommendation,
} from "@/lib/api/admin";
import {
  openReview,
  approveResource,
  rejectResource,
  deletionDecision,
  promoteResource,
} from "@/lib/api/resources";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const TABS = [
  { id: "teacher_uploads", label: "Teacher Uploads" },
  { id: "platform_resources", label: "Platform Resources" },
  { id: "escalations", label: "Escalations" },
  { id: "promotions", label: "Promotions" },
] as const;

type TabId = typeof TABS[number]["id"];

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-soft)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

export default function SubAdminQueuePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--ink-soft)]">Loading queue…</div>}>
      <SubAdminQueueContent />
    </Suspense>
  );
}

function SubAdminQueueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabId) ?? "teacher_uploads";
  const qc = useQueryClient();

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sub-admin-queue"],
    queryFn: getSubAdminQueue,
    staleTime: 1000 * 30,
  });

  const queueKey = ["sub-admin-queue"];

  const openReviewMutation = useMutation({
    mutationFn: openReview,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
  const approveMutation = useMutation({
    mutationFn: approveResource,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectResource(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKey });
      setRejectTarget(null);
      setRejectReason("");
    },
  });
  const deletionMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) => deletionDecision(id, approve),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKey });
      setDeletionTarget(null);
    },
  });
  const promoteMutation = useMutation({
    mutationFn: promoteResource,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
  const approveRecMutation = useMutation({
    mutationFn: approveRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });
  const denyRecMutation = useMutation({
    mutationFn: denyRecommendation,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });

  function setTab(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  }

  const activeItems: QueueItem[] =
    activeTab === "teacher_uploads"
      ? (data?.pendingTeacherUploads ?? [])
      : activeTab === "platform_resources"
      ? (data?.pendingPlatformResources ?? [])
      : activeTab === "escalations"
      ? (data?.escalations ?? [])
      : [];

  const promotions: PromotionRecommendation[] = data?.promotionRecommendations ?? [];

  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Manage</p>
          <h1 className="mt-2 text-[26px] font-semibold text-[var(--ink)]">Moderation Queue</h1>
          <p className="mt-1 text-[12px] text-[var(--ink-soft)]">Review and moderate resources in your college scope.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/manage/sub-admin/teacher-verifications">
            <Button variant="secondary">Teacher Verifications</Button>
          </Link>
          <Link href="/manage/sub-admin/cr-assignments">
            <Button variant="secondary">CR Assignments</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 rounded-[10px] border border-[var(--line-soft)] bg-[var(--ph)] p-1">
        {TABS.map((tab) => {
          const count =
            tab.id === "teacher_uploads" ? (data?.pendingTeacherUploads?.length ?? 0)
            : tab.id === "platform_resources" ? (data?.pendingPlatformResources?.length ?? 0)
            : tab.id === "escalations" ? (data?.escalations?.length ?? 0)
            : (data?.promotionRecommendations?.length ?? 0);
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition ${
                activeTab === tab.id
                  ? "bg-[var(--paper)] text-[var(--ink)] shadow-sm"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  activeTab === tab.id ? "bg-[var(--ink)] text-white" : "bg-[var(--ph-strong)] text-[var(--ink-soft)]"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-[8px] bg-[var(--ph)]" />)}
        </div>
      ) : error ? (
        <EmptyStateBlock title="Queue unavailable" description="Unable to load the moderation queue." />
      ) : activeTab === "promotions" ? (
        /* Promotions Tab */
        promotions.length === 0 ? (
          <EmptyStateBlock title="No pending recommendations" description="CR/Co-CR promotion recommendations will appear here." />
        ) : (
          <div className="space-y-2">
            {promotions.map((rec) => (
              <Card key={rec.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-[#ece9fb] bg-[#ece9fb] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[#7c6cd6]">
                      {rec.resource.type?.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-[var(--ink-soft)]">Recommended to Platform</span>
                  </div>
                  <p className="truncate text-[13px] font-medium text-[var(--ink)]">{rec.resource.title}</p>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    by {rec.recommendedBy?.email ?? rec.recommendedBy?.id} · {new Date(rec.recommendedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link href={`/resources/${rec.resource.id}`}>
                    <Button variant="ghost">View</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={() => denyRecMutation.mutate(rec.id)}
                    disabled={denyRecMutation.isPending}
                  >
                    Deny
                  </Button>
                  <Button
                    onClick={() => approveRecMutation.mutate(rec.id)}
                    disabled={approveRecMutation.isPending}
                  >
                    Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : activeItems.length === 0 ? (
        <EmptyStateBlock title="Queue is empty" description="No pending items in this category." />
      ) : (
        <div className="space-y-2">
          {activeItems.map((item) => (
            <QueueItemRow
              key={item.id}
              item={item}
              activeTab={activeTab}
              onOpenReview={() => openReviewMutation.mutate(item.id)}
              onApprove={() => approveMutation.mutate(item.id)}
              onReject={() => setRejectTarget(item.id)}
              onDeletionDecision={() => setDeletionTarget(item.id)}
              onPromote={() => promoteMutation.mutate(item.id)}
              isPending={
                openReviewMutation.isPending ||
                approveMutation.isPending ||
                promoteMutation.isPending
              }
            />
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={!!rejectTarget}
        title="Reject Resource"
        description="Provide a written reason. This will be visible to the uploader."
        onClose={() => { setRejectTarget(null); setRejectReason(""); }}
      >
        <div className="mt-4 space-y-4">
          <textarea
            className={`${inputCls} min-h-[100px]`}
            placeholder="Explain why this resource is being rejected…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={rejectReason.trim().length < 10 || rejectMutation.isPending}
              onClick={() => { if (rejectTarget) rejectMutation.mutate({ id: rejectTarget, reason: rejectReason.trim() }); }}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Confirm Rejection"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Deletion Decision Dialog */}
      <Dialog
        open={!!deletionTarget}
        title="Deletion Decision"
        description="The uploader flagged this for deletion. Choose how to proceed."
        onClose={() => setDeletionTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: false }); }} disabled={deletionMutation.isPending}>
            Deny — Keep
          </Button>
          <Button variant="destructive" onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: true }); }} disabled={deletionMutation.isPending}>
            Approve Deletion
          </Button>
        </div>
      </Dialog>
    </section>
  );
}

function QueueItemRow({
  item,
  activeTab,
  onOpenReview,
  onApprove,
  onReject,
  onDeletionDecision,
  onPromote,
  isPending,
}: {
  item: QueueItem;
  activeTab: TabId;
  onOpenReview: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDeletionDecision: () => void;
  onPromote: () => void;
  isPending: boolean;
}) {
  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-[var(--line-soft)] bg-[var(--ph)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            {item.type?.replace("_", " ")}
          </span>
          {item.deletionFlag && (
            <span className="rounded-full border border-[#c9973b]/40 bg-[#f6ecd8] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[#c9973b]">
              Deletion Flagged
            </span>
          )}
          <span className="rounded-full border border-[var(--line-soft)] bg-[var(--ph)] px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            {item.state}
          </span>
        </div>
        <p className="truncate text-[13px] font-medium text-[var(--ink)]">{item.title}</p>
        <p className="text-[11px] text-[var(--ink-soft)]">
          by {item.uploader?.name ?? item.uploader?.id} · {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link href={`/resources/${item.id}`}>
          <Button variant="ghost">View</Button>
        </Link>
        {item.state === "PENDING" && (
          <Button variant="secondary" onClick={onOpenReview} disabled={isPending}>Open Review</Button>
        )}
        {activeTab === "teacher_uploads" && item.state === "APPROVED" && (
          <Button variant="secondary" onClick={onPromote} disabled={isPending}>Promote</Button>
        )}
        {item.deletionFlag && (
          <Button variant="ghost" onClick={onDeletionDecision}>Deletion Decision</Button>
        )}
        {item.state === "IN_REVIEW" && (
          <>
            <Button onClick={onApprove} disabled={isPending}>Approve</Button>
            <Button variant="destructive" onClick={onReject}>Reject</Button>
          </>
        )}
      </div>
    </Card>
  );
}
