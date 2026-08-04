"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appointCR, revokeCR, listCRAssignments } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import Link from "next/link";

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function CRAssignmentsPage() {
  const qc = useQueryClient();
  const [showAppoint, setShowAppoint] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"CR" | "CO_CR">("CR");
  const [departmentId, setDepartmentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [appointError, setAppointError] = useState<string | null>(null);

  const qKey = ["cr-assignments"];

  const { data: assignments, isLoading } = useQuery({
    queryKey: qKey,
    queryFn: listCRAssignments,
    staleTime: 1000 * 60,
  });

  const appointMutation = useMutation({
    mutationFn: () => appointCR({ userId, role, departmentId, sessionId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qKey });
      setShowAppoint(false);
      setUserId(""); setDepartmentId(""); setSessionId("");
      setAppointError(null);
    },
    onError: (err: Error) => setAppointError(err.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeCR(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); setRevokeTarget(null); },
  });

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Manage</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">CR/Co-CR Assignments</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            Appoint or revoke CR and Co-CR roles for departments and sessions in your college.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAppoint(true)}>+ Appoint CR/Co-CR</Button>
          <Link href="/manage/sub-admin/queue">
            <Button variant="secondary">← Back to Queue</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : !assignments?.length ? (
        <EmptyStateBlock
          title="No active CR/Co-CR assignments"
          description="Appoint a student as CR or Co-CR to enable them to moderate resources in their department and session."
        />
      ) : (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] overflow-hidden">
          <div className="divide-y divide-[var(--line-soft)]">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge tone={a.type === "CR" || a.role === "CR" ? "platform" : "college"}>
                      {a.type ?? a.role}
                    </Badge>
                    <span className="truncate text-[12.5px] font-medium text-[var(--ink)]">
                      {a.name ?? a.userId}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    Dept: {a.departmentId} · Session: {a.sessionId}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="shrink-0 text-[11px] py-1 px-3"
                  onClick={() => setRevokeTarget(a.id)}
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
        title="Appoint CR or Co-CR"
        description="Enter the student's user ID and scope. A CR already assigned to the same Dept+Session must be revoked first."
        onClose={() => { setShowAppoint(false); setAppointError(null); }}
      >
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">User ID</span>
            <input className={inputCls} value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Student user ID" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Role</span>
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as "CR" | "CO_CR")}>
              <option value="CR">CR</option>
              <option value="CO_CR">Co-CR</option>
            </select>
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Department ID</span>
            <input className={inputCls} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} placeholder="Department ID" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Session ID</span>
            <input className={inputCls} value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="Session ID" />
          </label>
          {appointError && (
            <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{appointError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setShowAppoint(false); setAppointError(null); }}>Cancel</Button>
            <Button
              onClick={() => appointMutation.mutate()}
              disabled={!userId || !departmentId || !sessionId || appointMutation.isPending}
            >
              {appointMutation.isPending ? "Appointing…" : "Appoint"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog
        open={!!revokeTarget}
        title="Revoke CR/Co-CR"
        description="This will remove the CR/Co-CR role. Any pending In Review items will be transferred to the Sub Admin queue."
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
