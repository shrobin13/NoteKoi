"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { appointSubAdmin, revokeSubAdmin } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";

/**
 * Sub Admin Management — Milestone 7 task 2 / wireframe B.24
 * Appoint/Revoke actions use confirmed endpoints from wirefram-resolution.md §4 B.24.
 * List endpoint (GET /platform-admin/sub-admins) not explicitly enumerated per §3 →
 * UpcomingFeatureCard until backend confirms the route.
 * Saved Views → UpcomingFeatureCard per §1 OQ#10.
 */
export default function AdminSubAdminsPage() {
  const qc = useQueryClient();
  const [showAppoint, setShowAppoint] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const appointMutation = useMutation({
    mutationFn: () => appointSubAdmin({ userId, collegeId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sub-admins"] }); setShowAppoint(false); setUserId(""); setCollegeId(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeSubAdmin(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sub-admins"] }); setRevokeTarget(null); },
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Sub Admin Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Appoint and revoke Sub Admin roles for colleges on the platform.
          </p>
        </div>
        <Button onClick={() => setShowAppoint(true)}>+ Appoint Sub Admin</Button>
      </div>

      {/* Sub Admin list — UpcomingFeatureCard per wirefram-resolution.md §3 (GET list not enumerated) */}
      <UpcomingFeatureCard
        title="Sub Admin list isn't available yet"
        description="The backend GET /platform-admin/sub-admins list endpoint hasn't been explicitly defined. Active sub admins will appear here once the backend team confirms the list route."
      />

      {/* Saved Views — UpcomingFeatureCard per §1 OQ#10 */}
      <div className="mt-6">
        <UpcomingFeatureCard
          title="Saved Views aren't available yet"
          description="Custom filter and column preference persistence requires a backend endpoint that doesn't exist yet."
        />
      </div>

      {/* Appoint Dialog */}
      <Dialog
        open={showAppoint}
        title="Appoint Sub Admin"
        description="Enter the user's ID and the college they will manage."
        onClose={() => { setShowAppoint(false); setFormError(null); }}
      >
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">User ID</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID to appoint"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">College ID</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="College ID to manage"
            />
          </label>
          {formError && <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowAppoint(false); setFormError(null); }}>Cancel</Button>
            <Button onClick={() => appointMutation.mutate()} disabled={!userId || !collegeId || appointMutation.isPending}>
              {appointMutation.isPending ? "Appointing…" : "Appoint"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog
        open={!!revokeTarget}
        title="Revoke Sub Admin"
        description="This will remove the Sub Admin role for this user."
        onClose={() => setRevokeTarget(null)}
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setRevokeTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { if (revokeTarget) revokeMutation.mutate(revokeTarget); }} disabled={revokeMutation.isPending}>
            {revokeMutation.isPending ? "Revoking…" : "Confirm Revoke"}
          </Button>
        </div>
      </Dialog>
    </section>
  );
}
