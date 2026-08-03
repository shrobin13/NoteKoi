"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColleges, createCollege, updateCollege } from "@/lib/api/colleges";
import { getDepartments } from "@/lib/api/departments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";
import type { College, Department } from "@/lib/types";

type EntityTab = "colleges" | "departments" | "sessions" | "courses";

const TABS: { id: EntityTab; label: string }[] = [
  { id: "colleges", label: "Colleges" },
  { id: "departments", label: "Departments" },
  { id: "sessions", label: "Sessions" },
  { id: "courses", label: "Courses" },
];

/**
 * Structural CRUD — Milestone 7 task 1 / wireframe B.23
 * Single screen with entity-type tabs per wirefram-resolution.md §2 recommendation.
 * Saved Views → UpcomingFeatureCard per wirefram-resolution.md §1 OQ#10.
 */
export default function AdminStructurePage() {
  const [activeTab, setActiveTab] = useState<EntityTab>("colleges");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<College | null>(null);
  const [createName, setCreateName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const qc = useQueryClient();

  const { data: colleges, isLoading: loadingColleges } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    enabled: activeTab === "colleges",
    staleTime: 1000 * 60 * 5,
  });

  const { data: departments, isLoading: loadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    enabled: activeTab === "departments",
    staleTime: 1000 * 60 * 5,
  });

  // Sessions/courses are scoped per department; a flat list requires dept selection.
  // Showing note to filter by department (see Hierarchical Browse for full drill-down).
  const sessionsDisabled = true;
  const coursesDisabled = true;

  const createCollegeMutation = useMutation({
    mutationFn: () => createCollege({ name: createName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["colleges"] }); closeCreate(); },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateCollegeMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCollege(id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["colleges"] }); setEditTarget(null); setCreateName(""); },
    onError: (err: Error) => setFormError(err.message),
  });

  function closeCreate() {
    setShowCreate(false);
    setCreateName("");
    setFormError(null);
  }

  const isLoading = loadingColleges || loadingDepartments;

  function renderEntityRows() {
    if (activeTab === "colleges") {
      return colleges?.map((c) => (
        <EntityRow
          key={c.id}
          label={c.name}
          badge={c.isActive ? "Active" : "Inactive"}
          badgeColor={c.isActive ? "text-green-400" : "text-slate-400"}
          onEdit={() => { setEditTarget(c); setCreateName(c.name); }}
        />
      ));
    }
    if (activeTab === "departments") {
      return (departments as Department[])?.map((d) => (
        <EntityRow key={d.id} label={d.name} badge={d.collegeId ?? ""} />
      ));
    }
    if (activeTab === "sessions") {
      return (
        <div className="px-5 py-8 text-center text-sm text-slate-400">
          Sessions are scoped to a department. Select a department from the Departments tab to view its sessions.
        </div>
      );
    }
    if (activeTab === "courses") {
      return (
        <div className="px-5 py-8 text-center text-sm text-slate-400">
          Courses are scoped to a department. Select a department from the Departments tab to view its courses.
        </div>
      );
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Structural CRUD</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Manage colleges, departments, sessions, and courses for the platform.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Create {activeTab.slice(0, -1)}</Button>
      </div>

      {/* Entity-type tabs (one screen, four tabs per wirefram-resolution.md §2 recommendation) */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : (
        <Card className="border-slate-700/80 bg-slate-900/80 p-0 overflow-hidden">
          <div className="divide-y divide-slate-800">
            {renderEntityRows()}
          </div>
        </Card>
      )}

      {/* Saved Views — UpcomingFeatureCard per wirefram-resolution.md §1 OQ#10 */}
      <div className="mt-8">
        <UpcomingFeatureCard
          title="Saved Views aren't available yet"
          description="Custom filter and column preference persistence requires a backend endpoint that doesn't exist yet."
        />
      </div>

      {/* Create dialog (Colleges only for now) */}
      <Dialog
        open={showCreate}
        title={`Create ${activeTab.slice(0, -1)}`}
        onClose={closeCreate}
      >
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Name</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder={`Enter ${activeTab.slice(0, -1)} name`}
            />
          </label>
          {formError && (
            <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeCreate}>Cancel</Button>
            <Button
              onClick={() => { if (activeTab === "colleges") createCollegeMutation.mutate(); }}
              disabled={!createName.trim() || createCollegeMutation.isPending}
            >
              {createCollegeMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog (Colleges) */}
      <Dialog
        open={!!editTarget}
        title="Edit College"
        onClose={() => { setEditTarget(null); setCreateName(""); setFormError(null); }}
      >
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Name</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
            />
          </label>
          {formError && (
            <p className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setEditTarget(null); setCreateName(""); setFormError(null); }}>Cancel</Button>
            <Button
              onClick={() => { if (editTarget) updateCollegeMutation.mutate({ id: editTarget.id, name: createName }); }}
              disabled={!createName.trim() || updateCollegeMutation.isPending}
            >
              {updateCollegeMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}

function EntityRow({
  label,
  badge,
  badgeColor = "text-slate-400",
  onEdit,
}: {
  label: string;
  badge?: string;
  badgeColor?: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        {badge && <p className={`text-xs ${badgeColor}`}>{badge}</p>}
      </div>
      {onEdit && (
        <Button variant="ghost" onClick={onEdit} className="text-sm text-slate-400 hover:text-white">
          Edit
        </Button>
      )}
    </div>
  );
}
