"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCRQueue, approveStudentVerification } from "@/lib/api/admin";
import {
  openReview,
  approveResource,
  rejectResource,
  deletionDecision,
} from "@/lib/api/resources";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

/**
 * CR Moderation Queue — Milestone 5 task 1 / wireframe B.16
 * wirefram-resolution.md §3: Escalate renders UpcomingFeatureCard (no backend endpoint).
 * wirefram-resolution.md §2 row 11: No bulk-approve; all actions are per-item.
 */
export default function CRModerationQueuePage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["cr-queue"],
    queryFn: () => getCRQueue(),
    staleTime: 1000 * 30,
  });

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Deletion decision dialog state
  const [deletionTarget, setDeletionTarget] = useState<string | null>(null);

  // Escalate placeholder dialog
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Moderate</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">CR Moderation Queue</h1>
          {data?.scope ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Showing pending items for <span className="text-slate-200">{data.scope.department}</span>{" "}
              — <span className="text-slate-200">{data.scope.session}</span>
            </p>
          ) : (
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Review and moderate pending student uploads in your scope.
            </p>
          )}
        </div>
        <Link href="/moderate/cr/student-verifications">
          <Button variant="secondary">Student Verifications</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : error ? (
        <EmptyStateBlock
          title="Queue unavailable"
          description="Unable to load the moderation queue. Please try again."
        />
      ) : !data?.items?.length ? (
        <EmptyStateBlock
          title="Queue is empty"
          description="There are no pending items in your moderation scope. Check back later."
        />
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
                  by {item.uploader.name ?? item.uploader.id} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {item.state === "PENDING" && (
                  <Button
                    variant="secondary"
                    onClick={() => openReviewMutation.mutate(item.id)}
                    disabled={openReviewMutation.isPending}
                  >
                    Open Review
                  </Button>
                )}
                {item.deletionFlag && (
                  <Button
                    variant="ghost"
                    className="text-orange-300 hover:bg-orange-900/20"
                    onClick={() => setDeletionTarget(item.id)}
                  >
                    Deletion Decision
                  </Button>
                )}
                <Button
                  onClick={() => approveMutation.mutate(item.id)}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setRejectTarget(item.id)}
                >
                  Reject
                </Button>
                {/* Escalate — UpcomingFeatureCard per wirefram-resolution.md §3 */}
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:bg-slate-800"
                  onClick={() => setShowEscalate(true)}
                >
                  Escalate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog — requires written reason ≥ 10 chars (Milestone 5 §Validation) */}
      <Dialog
        open={!!rejectTarget}
        title="Reject Resource"
        description="Provide a written reason for rejection. This will be visible to the uploader."
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
            <Button variant="secondary" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={rejectReason.trim().length < 10 || rejectMutation.isPending}
              onClick={() => {
                if (rejectTarget) rejectMutation.mutate({ id: rejectTarget, reason: rejectReason.trim() });
              }}
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
        description="The uploader has flagged this resource for deletion. Choose how to proceed."
        onClose={() => setDeletionTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: false }); }}
            disabled={deletionMutation.isPending}
          >
            Deny — Continue Review
          </Button>
          <Button
            variant="destructive"
            onClick={() => { if (deletionTarget) deletionMutation.mutate({ id: deletionTarget, approve: true }); }}
            disabled={deletionMutation.isPending}
          >
            Approve Deletion
          </Button>
        </div>
      </Dialog>

      {/* Escalate — UpcomingFeatureCard per wirefram-resolution.md §3 (no POST .../escalate endpoint) */}
      <Dialog
        open={showEscalate}
        title="Escalate"
        onClose={() => setShowEscalate(false)}
      >
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
