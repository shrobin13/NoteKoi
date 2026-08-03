"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSubAdminQueue } from "@/lib/api/admin";
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
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const TABS = [
  { id: "teacher_uploads", label: "Teacher Uploads" },
  { id: "platform_resources", label: "Platform Resources" },
  { id: "escalations", label: "Escalations" },
  { id: "promotions", label: "Promotion Recommendations" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function SubAdminQueuePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading queue…</div>}>
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
    queryKey: ["sub-admin-queue", activeTab],
    queryFn: () => getSubAdminQueue(1, activeTab),
    enabled: activeTab !== "escalations" && activeTab !== "promotions",
    staleTime: 1000 * 30,
  });

  const queueKey = ["sub-admin-queue", activeTab];

  const openReviewMutation = useMutation({
    mutationFn: (id: string) => openReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveResource(id),
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
    mutationFn: (id: string) => promoteResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKey }),
  });

  function setTab(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manage</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Moderation Queue</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Review and moderate resources in your college scope.
          </p>
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

      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "escalations" && (
        <UpcomingFeatureCard
          title="Escalations aren't available yet"
          description="No escalation endpoint exists in the backend. Escalated items don't exist yet as a concept."
        />
      )}

      {activeTab === "promotions" && (
        <UpcomingFeatureCard
          title="Promotion Recommendations list isn't available yet"
          description="The backend GET list endpoint for promotion recommendations doesn't exist yet. Decision actions (approve/deny) are accessible from the Resource Detail page."
        />
      )}

      {activeTab !== "escalations" && activeTab !== "promotions" && (
        <>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
              ))}
            </div>
          ) : error ? (
            <EmptyStateBlock title="Queue unavailable" description="Unable to load the moderation queue." />
          ) : !data?.items?.length ? (
            <EmptyStateBlock title="Queue is empty" description="No pending items in this category." />
          ) : (
            <div className="space-y-3">
              {data.items.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col gap-4 border-slate-700/80 bg-slate-900/80 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {item.type.replace("_", " ")}
                      </span>
                      {item.deletionFlag && (
                        <span className="rounded-full border border-orange-700/60 bg-orange-900/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-orange-300">
                          Deletion flagged
                        </span>
                      )}
                    </div>
                    <p className="truncate font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      by {item.uploader.name ?? item.uploader.id} · {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {item.state === "PENDING" && (
                      <Button variant="secondary" onClick={() => openReviewMutation.mutate(item.id)} disabled={openReviewMutation.isPending}>
                        Open Review
                      </Button>
                    )}
                    {activeTab === "teacher_uploads" && item.state === "APPROVED" && (
                      <Button variant="secondary" onClick={() => promoteMutation.mutate(item.id)} disabled={promoteMutation.isPending}>
                        Promote to Platform
                      </Button>
                    )}
                    {item.deletionFlag && (
                      <Button variant="ghost" className="text-orange-300 hover:bg-orange-900/20" onClick={() => setDeletionTarget(item.id)}>
                        Deletion Decision
                      </Button>
                    )}
                    <Button onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending}>
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => setRejectTarget(item.id)}>
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog
        open={!!rejectTarget}
        title="Reject Resource"
        description="Provide a written reason. This will be visible to the uploader."
        onClose={() => { setRejectTarget(null); setRejectReason(""); }}
      >
        <div className="mt-4 space-y-4">
          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Explain why this resource is being rejected…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
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

      <Dialog
        open={!!deletionTarget}
        title="Deletion Decision"
        description="The uploader flagged this for deletion. Choose how to proceed."
        onClose={() => setDeletionTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: false }); }} disabled={deletionMutation.isPending}>
            Deny — Continue Review
          </Button>
          <Button variant="destructive" onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: true }); }} disabled={deletionMutation.isPending}>
            Approve Deletion
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
