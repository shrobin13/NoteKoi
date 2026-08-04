"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getColleges, createCollege, updateCollege } from "@/lib/api/colleges";
import { getDepartments, createDepartment, updateDepartment } from "@/lib/api/departments";
import { getSessionsByDepartment, createSession, updateSession } from "@/lib/api/sessions";
import { getCoursesByDepartment, createCourse, updateCourse } from "@/lib/api/courses";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { College, Department, Session, Course } from "@/lib/types";

type EntityTab = "colleges" | "departments" | "sessions" | "courses";

const TABS: { id: EntityTab; label: string }[] = [
  { id: "colleges", label: "Colleges" },
  { id: "departments", label: "Departments" },
  { id: "sessions", label: "Sessions" },
  { id: "courses", label: "Courses" },
];

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function AdminStructurePage() {
  const [activeTab, setActiveTab] = useState<EntityTab>("colleges");

  // Scoping selectors for sessions/courses
  const [scopeDeptId, setScopeDeptId] = useState("");

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Administration</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Structural CRUD</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
          Manage colleges, departments, sessions, and courses for the platform.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-[8px] px-4 py-1.5 text-[12px] font-medium transition ${
              activeTab === tab.id
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "colleges" && <CollegesPanel />}
      {activeTab === "departments" && <DepartmentsPanel />}
      {activeTab === "sessions" && (
        <SessionsPanel scopeDeptId={scopeDeptId} setScopeDeptId={setScopeDeptId} />
      )}
      {activeTab === "courses" && (
        <CoursesPanel scopeDeptId={scopeDeptId} setScopeDeptId={setScopeDeptId} />
      )}
    </section>
  );
}

// ─── Colleges ────────────────────────────────────────────────────────────────

function CollegesPanel() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<College | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: colleges, isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: () => createCollege({ name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["colleges"] }); setShowCreate(false); setName(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateCollege(editTarget!.id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["colleges"] }); setEditTarget(null); setName(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => { setShowCreate(true); setName(""); setFormError(null); }}>+ Add College</Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-[8px] bg-[var(--ph)]" />)}</div>
      ) : (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] overflow-hidden">
          <div className="divide-y divide-[var(--line-soft)]">
            {(colleges ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink)]">{c.name}</p>
                  <p className={`text-[11px] ${c.isActive ? "text-[#2f9e52]" : "text-[var(--ink-soft)]"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
                <Button variant="ghost" className="text-[11px] py-1 px-3" onClick={() => { setEditTarget(c); setName(c.name); setFormError(null); }}>
                  Edit
                </Button>
              </div>
            ))}
            {(colleges ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-[var(--ink-soft)]">No colleges yet.</p>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreate} title="Add College" onClose={() => setShowCreate(false)}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="College name" />
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={!!editTarget} title="Edit College" onClose={() => { setEditTarget(null); setFormError(null); }}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setEditTarget(null); setFormError(null); }}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!name.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

// ─── Departments ─────────────────────────────────────────────────────────────

function DepartmentsPanel() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: () => createDepartment({ name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); setShowCreate(false); setName(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateDepartment(editTarget!.id, { name }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); setEditTarget(null); setName(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => { setShowCreate(true); setName(""); setFormError(null); }}>+ Add Department</Button>
      </div>
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-[8px] bg-[var(--ph)]" />)}</div>
      ) : (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] overflow-hidden">
          <div className="divide-y divide-[var(--line-soft)]">
            {(departments ?? []).map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink)]">{d.name}</p>
                  {d.collegeId && <p className="text-[11px] text-[var(--ink-soft)]">College: {d.collegeId}</p>}
                </div>
                <Button variant="ghost" className="text-[11px] py-1 px-3" onClick={() => { setEditTarget(d); setName(d.name); setFormError(null); }}>
                  Edit
                </Button>
              </div>
            ))}
            {(departments ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-[var(--ink-soft)]">No departments yet.</p>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreate} title="Add Department" onClose={() => setShowCreate(false)}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" />
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={!!editTarget} title="Edit Department" onClose={() => { setEditTarget(null); setFormError(null); }}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setEditTarget(null); setFormError(null); }}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!name.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

function SessionsPanel({ scopeDeptId, setScopeDeptId }: { scopeDeptId: string; setScopeDeptId: (v: string) => void }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Session | null>(null);
  const [label, setLabel] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 1000 * 60 * 5 });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", scopeDeptId],
    queryFn: () => getSessionsByDepartment(scopeDeptId),
    enabled: !!scopeDeptId,
    staleTime: 1000 * 60 * 2,
  });

  const createMutation = useMutation({
    mutationFn: () => createSession(scopeDeptId, { departmentId: scopeDeptId, label, isOpen }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions", scopeDeptId] }); setShowCreate(false); setLabel(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateSession(editTarget!.id, { label, isOpen }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sessions", scopeDeptId] }); setEditTarget(null); setLabel(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[12px]">
          <span className="font-medium text-[var(--ink)]">Department:</span>
          <select
            className={`${inputCls} w-auto`}
            value={scopeDeptId}
            onChange={(e) => setScopeDeptId(e.target.value)}
          >
            <option value="">Select department…</option>
            {(departments ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        {scopeDeptId && (
          <Button onClick={() => { setShowCreate(true); setLabel(""); setIsOpen(true); setFormError(null); }}>
            + Add Session
          </Button>
        )}
      </div>

      {!scopeDeptId ? (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] px-4 py-8 text-center text-[12px] text-[var(--ink-soft)]">
          Select a department above to view and manage its sessions.
        </div>
      ) : isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-[8px] bg-[var(--ph)]" />)}</div>
      ) : (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] overflow-hidden">
          <div className="divide-y divide-[var(--line-soft)]">
            {(sessions ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink)]">{s.label}</p>
                  <p className={`text-[11px] ${s.isOpen ? "text-[#2f9e52]" : "text-[var(--ink-soft)]"}`}>
                    {s.isOpen ? "Open" : "Closed"}
                  </p>
                </div>
                <Button variant="ghost" className="text-[11px] py-1 px-3" onClick={() => { setEditTarget(s); setLabel(s.label); setIsOpen(s.isOpen); setFormError(null); }}>
                  Edit
                </Button>
              </div>
            ))}
            {(sessions ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-[var(--ink-soft)]">No sessions for this department yet.</p>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreate} title="Add Session" onClose={() => setShowCreate(false)}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Label (e.g. &ldquo;2023–24 Even&rdquo;)</span>
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Session label" />
          </label>
          <label className="flex items-center gap-2 text-[12px]">
            <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
            <span className="text-[var(--ink)]">Open for new uploads</span>
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!label.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={!!editTarget} title="Edit Session" onClose={() => { setEditTarget(null); setFormError(null); }}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Label</span>
            <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-[12px]">
            <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />
            <span className="text-[var(--ink)]">Open for new uploads</span>
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setEditTarget(null); setFormError(null); }}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!label.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

// ─── Courses ─────────────────────────────────────────────────────────────────

function CoursesPanel({ scopeDeptId, setScopeDeptId }: { scopeDeptId: string; setScopeDeptId: (v: string) => void }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Course | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: departments } = useQuery({ queryKey: ["departments"], queryFn: getDepartments, staleTime: 1000 * 60 * 5 });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", scopeDeptId],
    queryFn: () => getCoursesByDepartment(scopeDeptId),
    enabled: !!scopeDeptId,
    staleTime: 1000 * 60 * 2,
  });

  const createMutation = useMutation({
    mutationFn: () => createCourse(scopeDeptId, { departmentId: scopeDeptId, name, description: description || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses", scopeDeptId] }); setShowCreate(false); setName(""); setDescription(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateCourse(editTarget!.id, { name, description: description || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses", scopeDeptId] }); setEditTarget(null); setName(""); setDescription(""); setFormError(null); },
    onError: (err: Error) => setFormError(err.message),
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[12px]">
          <span className="font-medium text-[var(--ink)]">Department:</span>
          <select
            className={`${inputCls} w-auto`}
            value={scopeDeptId}
            onChange={(e) => setScopeDeptId(e.target.value)}
          >
            <option value="">Select department…</option>
            {(departments ?? []).map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        {scopeDeptId && (
          <Button onClick={() => { setShowCreate(true); setName(""); setDescription(""); setFormError(null); }}>
            + Add Course
          </Button>
        )}
      </div>

      {!scopeDeptId ? (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] px-4 py-8 text-center text-[12px] text-[var(--ink-soft)]">
          Select a department above to view and manage its courses.
        </div>
      ) : isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-[8px] bg-[var(--ph)]" />)}</div>
      ) : (
        <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] overflow-hidden">
          <div className="divide-y divide-[var(--line-soft)]">
            {(courses ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--ink)]">{c.name}</p>
                  {c.description && <p className="text-[11px] text-[var(--ink-soft)]">{c.description}</p>}
                </div>
                <Button variant="ghost" className="text-[11px] py-1 px-3" onClick={() => { setEditTarget(c); setName(c.name); setDescription(c.description ?? ""); setFormError(null); }}>
                  Edit
                </Button>
              </div>
            ))}
            {(courses ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-[12px] text-[var(--ink-soft)]">No courses for this department yet.</p>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreate} title="Add Course" onClose={() => setShowCreate(false)}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Course Name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Data Structures & Algorithms" />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Description (optional)</span>
            <textarea className={`${inputCls} min-h-[60px]`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief course description" />
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={!!editTarget} title="Edit Course" onClose={() => { setEditTarget(null); setFormError(null); }}>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Course Name</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block space-y-1.5 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Description (optional)</span>
            <textarea className={`${inputCls} min-h-[60px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {formError && <p className="rounded-[8px] bg-[#fbe6e6] px-3 py-2 text-[12px] text-[#d24545]">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => { setEditTarget(null); setFormError(null); }}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!name.trim() || updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
