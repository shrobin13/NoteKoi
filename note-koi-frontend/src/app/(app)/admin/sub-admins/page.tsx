"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointSubAdmin, revokeSubAdmin, listSubAdmins } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function AdminSubAdminsPage() {
  const qc = useQueryClient();
  const [showAppoint, setShowAppoint] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const qKey = ["sub-admins"];

  const { data: subAdmins, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: listSubAdmins,
    staleTime: 1000 * 60 * 2,
  });

  const appointMutation = useMutation({
    mutationFn: () => appointSubAdmin({ userId, collegeId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      setShowAppoint(false);
      setUserId(""); setCollegeId(""); setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeSubAdmin(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); setRevokeTarget(null); },
  });

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Administration</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Sub Admin Management</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            Appoint and revoke Sub Admin roles for colleges on the platform.
          </p>
        </div>
        <Button onClick={() => setShowAppoint(true)}>+ Appoint Sub Admin</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : !subAdmins?.length ? (
        <EmptyStateBlock
          title="No active sub admins"
          description="Appoint a user as Sub Admin to give them college-level moderation authority."
        />
      ) : (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] overflow-hidden">
          <div className="divide-y divide-[var(--line-soft)]">
            {subAdmins.map((sa) => (
              <div key={sa.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                    {sa.name ?? sa.email ?? sa.userId}
                  </p>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    {sa.email && <span>{sa.email} · </span>}
                    College: {sa.collegeName ?? sa.collegeId}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="shrink-0 text-[11px] py-1 px-3"
                  onClick={() => setRevokeTarget(sa.id)}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appoint Dialog */}
      <Dialog
        open={showAppoint}
        title="Appoint Sub Admin"
        description="Enter the user's ID and the college they will manage."
        onClose={() => { setShowAppoint(false); setFormError(null); }}
      >
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">User ID</span>
            <input className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID to appoint" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">College ID</span>
            <input className={inputCls} value={collegeId} onChange={(e) => setCollegeId(e.target.value)} placeholder="College ID to manage" />
          </label>
          {formError && (
            <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setShowAppoint(false); setFormError(null); }}>Cancel</Button>
            <Button
              onClick={() => appointMutation.mutate()}
              disabled={!userId || !collegeId || appointMutation.isPending}
            >
              {appointMutation.isPending ? "Appointing…" : "Appoint"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog
        open={!!revokeTarget}
        title="Revoke Sub Admin"
        description="This will remove the Sub Admin role for this user and downgrade them to a regular student."
        onClose={() => setRevokeTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setRevokeTarget(null)}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => { if (revokeTarget) revokeMutation.mutate(revokeTarget); }}
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending ? "Revoking…" : "Confirm Revoke"}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
