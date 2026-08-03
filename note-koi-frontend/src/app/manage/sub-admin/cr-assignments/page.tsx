"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointCR, revokeCR } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";
import Link from "next/link";

/**
 * CR/Co-CR Management — Milestone 6 task 3 / wireframe B.21
 * wirefram-resolution.md §3: The GET /sub-admin/cr-assignments list endpoint is not explicitly enumerated —
 * per process discipline we do NOT assume a URL. The list is therefore an UpcomingFeatureCard until backend confirms.
 * Actions (appoint / revoke) use confirmed endpoints from §4 B.21.
 */
export default function CRAssignmentsPage() {
  const qc = useQueryClient();
  const [showAppoint, setShowAppoint] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  // Appoint form state
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"CR" | "CO_CR">("CR");
  const [departmentId, setDepartmentId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [appointError, setAppointError] = useState<string | null>(null);

  const appointMutation = useMutation({
    mutationFn: () => appointCR({ userId, role, departmentId, sessionId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cr-assignments"] });
      setShowAppoint(false);
      setUserId("");
      setDepartmentId("");
      setSessionId("");
      setAppointError(null);
    },
    onError: (err: Error) => setAppointError(err.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeCR(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cr-assignments"] });
      setRevokeTarget(null);
    },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manage</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">CR/Co-CR Assignments</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Appoint or revoke CR and Co-CR roles for departments and sessions in your college.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAppoint(true)}>Appoint CR/Co-CR</Button>
          <Link href="/manage/sub-admin/queue">
            <Button variant="secondary">← Back to Queue</Button>
          </Link>
        </div>
      </div>

      {/* CR Assignments list — UpcomingFeatureCard per wirefram-resolution.md §3 (GET list not enumerated) */}
      <UpcomingFeatureCard
        title="CR Assignment list isn't available yet"
        description="The backend GET /sub-admin/cr-assignments list endpoint hasn't been explicitly defined. Active assignments will appear here once the backend team confirms the list route."
      />

      {/* Appoint Dialog */}
      <Dialog
        open={showAppoint}
        title="Appoint CR or Co-CR"
        description="Enter the student's user ID and scope details. A CR already assigned to the same Dept+Session must be revoked first."
        onClose={() => { setShowAppoint(false); setAppointError(null); }}
      >
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">User ID</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Student user ID"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Role</span>
            <select
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value as "CR" | "CO_CR")}
            >
              <option value="CR">CR</option>
              <option value="CO_CR">Co-CR</option>
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Department ID</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              placeholder="Department ID"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Session ID</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Session ID"
            />
          </label>
          {appointError && (
            <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{appointError}</p>
          )}
          <div className="flex justify-end gap-3">
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

      {/* Revoke Confirmation Dialog */}
      <Dialog
        open={!!revokeTarget}
        title="Revoke CR/Co-CR"
        description="This will remove the CR/Co-CR role. Any pending In Review items will be transferred to the Sub Admin queue."
        onClose={() => setRevokeTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-3">
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
