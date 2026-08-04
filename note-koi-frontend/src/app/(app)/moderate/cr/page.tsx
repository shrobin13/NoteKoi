"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCRQueue } from "@/lib/api/admin";
import {
  openReview,
  approveResource,
  rejectResource,
  deletionDecision,
} from "@/lib/api/resources";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

const textareaCls =
  "min-h-[100px] w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function CRModerationQueuePage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["cr-queue"],
    queryFn: () => getCRQueue(),
    staleTime: 1000 * 30,
  });

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);
  const [showEscalate, setShowEscalate] = useState(false);

  const queueKey = ["cr-queue"];

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

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Moderate</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">CR Moderation Queue</h1>
          {data?.scope ? (
            <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
              Showing pending items for <span className="font-medium text-[var(--ink)]">{data.scope.department}</span>{" "}
              — <span className="font-medium text-[var(--ink)]">{data.scope.session}</span>
            </p>
          ) : (
            <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
              Review and moderate pending student uploads in your scope.
            </p>
          )}
        </div>
        <Link href="/moderate/cr/student-verifications">
          <Button variant="secondary">Student Verifications</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : error ? (
        <EmptyStateBlock title="Queue unavailable" description="Unable to load the moderation queue. Please try again." />
      ) : !data?.items?.length ? (
        <EmptyStateBlock title="Queue is empty" description="There are no pending items in your moderation scope. Check back later." />
      ) : (
        <div className="space-y-2">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone="slate">{(item.type ?? item.resourceType ?? "").replace("_", " ")}</Badge>
                  {item.deletionFlag && <Badge tone="deletion">Deletion flagged</Badge>}
                </div>
                <p className="truncate text-[13px] font-medium text-[var(--ink)]">{item.title}</p>
                <p className="text-[11.5px] text-[var(--ink-soft)]">
                  by {item.uploader?.name ?? item.uploader?.email ?? "Unknown"} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {item.state === "PENDING" && (
                  <Button variant="secondary" className="text-[11px] py-1 px-3" onClick={() => openReviewMutation.mutate(item.id)} disabled={openReviewMutation.isPending}>
                    Open Review
                  </Button>
                )}
                {item.deletionFlag && (
                  <Button variant="ghost" className="text-[11px] py-1 px-3 text-[#c9973b]" onClick={() => setDeletionTarget(item.id)}>
                    Deletion Decision
                  </Button>
                )}
                <Button className="text-[11px] py-1 px-3" onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending}>
                  Approve
                </Button>
                <Button variant="destructive" className="text-[11px] py-1 px-3" onClick={() => setRejectTarget(item.id)}>
                  Reject
                </Button>
                <Button variant="ghost" className="text-[11px] py-1 px-3 text-[var(--ink-soft)]" onClick={() => setShowEscalate(true)}>
                  Escalate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!rejectTarget}
        title="Reject Resource"
        description="Provide a written reason for rejection. This will be visible to the uploader."
        onClose={() => { setRejectTarget(null); setRejectReason(""); }}
      >
        <div className="mt-4 space-y-3">
          <textarea
            className={textareaCls}
            placeholder="Explain why this resource is being rejected…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
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
        description="The uploader has flagged this resource for deletion. Choose how to proceed."
        onClose={() => setDeletionTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: false }); }} disabled={deletionMutation.isPending}>
            Deny — Continue Review
          </Button>
          <Button variant="destructive" onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: true }); }} disabled={deletionMutation.isPending}>
            Approve Deletion
          </Button>
        </div>
      </Dialog>

      <Dialog open={showEscalate} title="Escalate" onClose={() => setShowEscalate(false)}>
        <div className="mt-4">
          <UpcomingFeatureCard
            title="Escalation isn't available yet"
            description="Reach out to your Sub Admin directly for escalations. No escalation endpoint exists in the backend yet."
          />
        </div>
      </Dialog>
    </section>
  );
}
