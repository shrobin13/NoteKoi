"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Building2, BookOpen, FileText, Crown, ShieldAlert,
  Plus, Trash2, X, CheckCircle, XCircle, UserPlus, LayoutGrid,
  ShieldCheck, ChevronDown, ChevronRight, Layers, GraduationCap, Sparkles,
} from "lucide-react";
import { getAdminStats, getSubAdmins, promoteSubAdmin, demoteSubAdmin, transferOwnership, getCRs, assignCR, demoteCR } from "@/lib/admin";
import { createCollege, getColleges, getClassroomUnits, getDepartments, bootstrapCollege, addClassroomUnitToDept } from "@/lib/hierarchy";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/lib/verification";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import type { CrSeat, CRMember, Department } from "@/lib/types";

type ActiveTab = "overview" | "subadmins" | "crs" | "verifications" | "structure";

export default function OwnerDashboardPage() {
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Sub Admin modals
  const [showPromoteSubModal, setShowPromoteSubModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCreateCollegeModal, setShowCreateCollegeModal] = useState(false);
  const [createCollegeStep, setCreateCollegeStep] = useState(0);
  const [subUserId, setSubUserId] = useState("");
  const [subCollegeId, setSubCollegeId] = useState("");
  const [newCollegeName, setNewCollegeName] = useState("");
  const [createDepartmentName, setCreateDepartmentName] = useState("");
  const [createSessionLabel, setCreateSessionLabel] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [createCollegeError, setCreateCollegeError] = useState("");

  // CR promotion (owner admin fallback)
  const [showPromoteCRModal, setShowPromoteCRModal] = useState(false);
  const [crUserId, setCrUserId] = useState("");
  const [crUnitId, setCrUnitId] = useState("");
  const [crSeat, setCrSeat] = useState<CrSeat>("MAIN");
  const [crError, setCrError] = useState("");
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [transferUserId, setTransferUserId] = useState("");

  // ── Structure Setup state ──────────────────────────────────────────────────
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapStep, setBootstrapStep] = useState(0);
  const [bootstrapCollegeName, setBootstrapCollegeName] = useState("");
  const [bootstrapDeptName, setBootstrapDeptName] = useState("");
  const [bootstrapSession, setBootstrapSession] = useState("");
  const [bootstrapError, setBootstrapError] = useState("");

  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [addSessionDeptId, setAddSessionDeptId] = useState("");
  const [addSessionDeptName, setAddSessionDeptName] = useState("");
  const [addSessionLabel, setAddSessionLabel] = useState("");
  const [addSessionError, setAddSessionError] = useState("");

  const [expandedCollegeId, setExpandedCollegeId] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: "Owner Dashboard", href: "/admin/owner" }]);
  }, [setBreadcrumbs]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const { data: subAdmins = [] } = useQuery({
    queryKey: ["sub-admins"],
    queryFn: getSubAdmins,
  });

  const { data: collegesData } = useQuery({
    queryKey: ["colleges-list"],
    queryFn: () => getColleges(1, 100),
  });

  const { data: allUnits } = useQuery({
    queryKey: ["all-classroom-units"],
    queryFn: () => getClassroomUnits(),
    enabled: activeTab === "crs",
  });

  const { data: unitCRs } = useQuery({
    queryKey: ["crs", expandedUnitId],
    queryFn: () => getCRs(expandedUnitId!),
    enabled: !!expandedUnitId,
  });

  const { data: pendingData } = useQuery({
    queryKey: ["owner-pending-verifications"],
    queryFn: () => getPendingVerifications(1, 50),
    enabled: activeTab === "verifications",
  });

  // ── Structure Setup data ───────────────────────────────────────────────────
  // Fetch departments for the expanded college in the tree view
  const { data: expandedCollegeDepts = [], refetch: refetchDepts } = useQuery({
    queryKey: ["college-depts-tree", expandedCollegeId],
    queryFn: () => getDepartments(expandedCollegeId!, 1, 200),
    enabled: activeTab === "structure" && !!expandedCollegeId,
    select: (res) => (Array.isArray(res) ? res : (res as any)?.data ?? []) as Department[],
  });

  // Fetch classroom units for the expanded college (for the tree)
  const { data: treeUnits = [], refetch: refetchUnits } = useQuery({
    queryKey: ["structure-units", expandedCollegeId],
    queryFn: () => getClassroomUnits(expandedCollegeId!),
    enabled: activeTab === "structure" && !!expandedCollegeId,
    select: (res) => (Array.isArray(res) ? res : (res as any)?.data ?? []) as ReturnType<typeof Array.prototype.flat>,
  });

  const colleges = collegesData?.data ?? [];
  const units: any[] = (Array.isArray(allUnits) ? allUnits : (allUnits as any)?.data) ?? [];
  const pending = pendingData?.data ?? [];

  // ── Bootstrap mutation ─────────────────────────────────────────────────────
  const { mutate: handleBootstrap, isPending: bootstrapping } = useMutation({
    mutationFn: () => bootstrapCollege({
      collegeName: bootstrapCollegeName.trim(),
      departmentName: bootstrapDeptName.trim(),
      sessionLabel: bootstrapSession.trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      queryClient.invalidateQueries({ queryKey: ["colleges-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["structure-units"] });
      setShowBootstrapModal(false);
      setBootstrapStep(0);
      setBootstrapCollegeName(""); setBootstrapDeptName(""); setBootstrapSession(""); setBootstrapError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setBootstrapError(e?.response?.data?.message ?? "Bootstrap failed");
    },
  });

  // ── Add session mutation ───────────────────────────────────────────────────
  const { mutate: handleAddSession, isPending: addingSession } = useMutation({
    mutationFn: () => addClassroomUnitToDept(addSessionDeptId, addSessionLabel.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structure-units", expandedCollegeId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["all-classroom-units"] });
      setShowAddSessionModal(false);
      setAddSessionLabel(""); setAddSessionError(""); setAddSessionDeptId(""); setAddSessionDeptName("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setAddSessionError(e?.response?.data?.message ?? "Failed to add session");
    },
  });

  // ── Sub Admin actions ──────────────────────────────────────────────────────
  const { mutate: handlePromoteSub, isPending: promotingSub } = useMutation({
    mutationFn: () => promoteSubAdmin(subUserId, subCollegeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
      setShowPromoteSubModal(false);
      setSubUserId(""); setSubCollegeId(""); setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to promote Sub Admin");
    },
  });

  const { mutate: handleDemoteSub } = useMutation({
    mutationFn: (uid: string) => demoteSubAdmin(uid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sub-admins"] }),
  });

  const { mutate: handleTransfer, isPending: transferring } = useMutation({
    mutationFn: () => transferOwnership(transferUserId),
    onSuccess: () => {
      setShowTransferModal(false);
      window.location.href = "/dashboard";
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to transfer ownership");
    },
  });

  const { mutate: handleCreateCollegeChain, isPending: creatingCollege } = useMutation({
    mutationFn: () => bootstrapCollege({
      collegeName: newCollegeName.trim(),
      departmentName: createDepartmentName.trim(),
      sessionLabel: createSessionLabel.trim(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      queryClient.invalidateQueries({ queryKey: ["colleges-list"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["structure-units"] });
      setShowCreateCollegeModal(false);
      setCreateCollegeStep(0);
      setNewCollegeName("");
      setCreateDepartmentName("");
      setCreateSessionLabel("");
      setCreateCollegeError("");
      setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setCreateCollegeError(e?.response?.data?.message ?? "Failed to create college and chain");
    },
  });

  // ── CR actions (owner fallback) ─────────────────────────────────────────────
  const { mutate: handlePromoteCR, isPending: promotingCR } = useMutation({
    mutationFn: () => assignCR({ userId: crUserId, classroomUnitId: crUnitId, seat: crSeat }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crs", crUnitId] });
      queryClient.invalidateQueries({ queryKey: ["crs", expandedUnitId] });
      setShowPromoteCRModal(false);
      setCrUserId(""); setCrUnitId(""); setCrError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setCrError(e?.response?.data?.message ?? "Failed to promote CR");
    },
  });

  const { mutate: handleDemoteCR } = useMutation({
    mutationFn: (uid: string) => demoteCR({ userId: uid, classroomUnitId: expandedUnitId! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crs", expandedUnitId] }),
  });

  // ── Verification actions ────────────────────────────────────────────────────
  const { mutate: handleApprove, isPending: approving } = useMutation({
    mutationFn: (id: string) => approveVerification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner-pending-verifications"] }),
  });

  const { mutate: handleReject, isPending: rejecting } = useMutation({
    mutationFn: (id: string) => rejectVerification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner-pending-verifications"] }),
  });

  const TABS: { key: ActiveTab; label: string }[] = [
    { key: "overview", label: "Platform Overview" },
    { key: "subadmins", label: "Sub Admins" },
    { key: "crs", label: "CR Management (Fallback)" },
    { key: "verifications", label: "Verifications (Fallback)" },
    { key: "structure", label: "Structure Setup" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Platform Governance
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Platform-wide metrics, Sub Admin assignments, CR fallback, and ownership transfer
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Badge variant="OWNER_ADMIN">Owner Scope</Badge>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => {
              setShowCreateCollegeModal(true);
              setCreateCollegeStep(0);
              setCreateCollegeError("");
            }}
          >
            Create College & Chain
          </Button>
          <Button variant="accent" size="sm" icon={<Plus size={15} />} onClick={() => setShowPromoteSubModal(true)}>
            Promote Sub Admin
          </Button>
          <Button variant="ghost" size="sm" icon={<Crown size={15} />} onClick={() => setShowTransferModal(true)} style={{ color: "#dc2626" }}>
            Transfer Ownership
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 32, overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 18px", fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: "0.85rem", border: "none", background: "transparent", cursor: "pointer",
              whiteSpace: "nowrap",
              color: activeTab === tab.key ? "var(--default-color)" : "var(--text-muted)",
              borderBottom: activeTab === tab.key ? "2px solid var(--default-color)" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
            {isLoading ? (
              <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
            ) : (
              [
                { icon: <Users size={20} />, label: "Total Users", value: stats?.totalUsers ?? 0, color: "var(--default-color)" },
                { icon: <Building2 size={20} />, label: "Colleges", value: stats?.totalColleges ?? 0, color: "var(--secondary)" },
                { icon: <BookOpen size={20} />, label: "Departments", value: stats?.totalDepartments ?? 0, color: "var(--accent)" },
                { icon: <FileText size={20} />, label: "Resources", value: stats?.totalResources ?? 0, color: "var(--default-color)" },
                { icon: <LayoutGrid size={20} />, label: "Classroom Units", value: stats?.totalClassroomUnits ?? 0, color: "var(--secondary)" },
                { icon: <ShieldCheck size={20} />, label: "Pending Verifications", value: stats?.pendingVerifications ?? 0, color: "var(--accent)" },
              ].map((stat) => (
                <Card key={stat.label} padding="lg">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>
                      {stat.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                        {stat.label}
                      </p>
                      <p style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-display)", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <Card padding="lg">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, marginBottom: 12 }}>
              Owner Admin Responsibilities
            </h3>
            <ul style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.8, paddingLeft: 20 }}>
              <li>Promote / demote Sub Admins for any college on the platform</li>
              <li>Transfer platform ownership to another verified user (irreversible)</li>
              <li>As fallback: promote / demote CRs for any classroom unit across all colleges</li>
              <li>As fallback: approve or reject student verification requests platform-wide</li>
              <li>Create new colleges and view platform-wide analytics</li>
            </ul>
          </Card>
        </motion.div>
      )}

      {/* ── Tab: Sub Admins ──────────────────────────────────────────────────── */}
      {activeTab === "subadmins" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card padding="lg">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700 }}>
                Active Sub Admins
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>{subAdmins.length} assigned</span>
                <Button variant="accent" size="sm" icon={<Plus size={14} />} onClick={() => setShowPromoteSubModal(true)}>
                  Promote
                </Button>
              </div>
            </div>

            {subAdmins.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {subAdmins.map((sub) => {
                  const collegeName = colleges.find((c) => c.id === sub.collegeId)?.name ?? sub.collegeId ?? "Unknown College";
                  return (
                    <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--surface-glass-dark)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {sub.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{sub.name}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{sub.email}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Badge variant="SUB_ADMIN">{collegeName}</Badge>
                        <button onClick={() => handleDemoteSub(sub.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#dc2626", padding: 6 }} title="Demote Sub Admin">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", textAlign: "center", padding: 32 }}>No sub admins promoted yet.</p>
            )}
          </Card>
        </motion.div>
      )}

      {/* ── Tab: CR Management (Owner Fallback) ──────────────────────────────── */}
      {activeTab === "crs" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                CR Assignments — Owner Fallback
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: 2 }}>
                Platform-wide CR promote/demote fallback when a Sub Admin is unavailable
              </p>
            </div>
            <Button variant="accent" size="sm" icon={<UserPlus size={14} />} onClick={() => setShowPromoteCRModal(true)}>
              Promote CR
            </Button>
          </div>

          {units.length === 0 ? (
            <Card padding="lg" style={{ textAlign: "center" }}>
              <LayoutGrid size={32} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No classroom units found.</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {units.map((unit) => {
                const isExpanded = expandedUnitId === unit.id;
                return (
                  <Card key={unit.id} padding="none" style={{ overflow: "hidden" }}>
                    <button
                      onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <LayoutGrid size={16} style={{ color: "var(--default-color)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
                          {unit.department?.name ?? "Department"} · {unit.session?.name ?? "Session"}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>Unit: {unit.id.slice(0, 12)}…</p>
                      </div>
                      {isExpanded ? <ChevronDown size={16} style={{ color: "var(--text-subtle)" }} /> : <ChevronRight size={16} style={{ color: "var(--text-subtle)" }} />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                          <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, marginBottom: 12 }}>
                              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Class Representatives</p>
                              <button
                                onClick={() => { setCrUnitId(unit.id); setShowPromoteCRModal(true); }}
                                style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--default-color)", background: "rgba(143,191,159,0.15)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "4px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                              >
                                <UserPlus size={12} /> Add CR
                              </button>
                            </div>
                            {!unitCRs || unitCRs.length === 0 ? (
                              <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", textAlign: "center", padding: "12px 0" }}>No CRs assigned yet.</p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {unitCRs.map((cr: CRMember) => (
                                  <div key={cr.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface-glass-dark)", borderRadius: "var(--radius-sm)" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                      {cr.name?.charAt(0) ?? "?"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>{cr.name}</p>
                                      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>{cr.email}</p>
                                    </div>
                                    <Badge variant={cr.crSeat === "MAIN" ? "CR" : "admin"}>{cr.crSeat === "MAIN" ? "Main CR" : "Co-CR"}</Badge>
                                    <button onClick={() => handleDemoteCR(cr.id)} title="Demote CR" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#dc2626", padding: 6 }}>
                                      <XCircle size={15} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Verifications (Owner Fallback) ──────────────────────────────── */}
      {activeTab === "verifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Platform-Wide Pending Verifications
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: 2 }}>
              Approve or reject any student verification request as platform-wide fallback
            </p>
          </div>

          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
              <CheckCircle size={36} style={{ color: "var(--default-color)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No pending verifications across the platform.</p>
            </div>
          ) : (
            <div style={{ background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", overflow: "hidden" }}>
              {pending.map((req, i) => (
                <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: i < pending.length - 1 ? "1px solid var(--border)" : "none", flexWrap: "wrap" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {req.user?.name?.charAt(0) ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{req.user?.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{req.user?.email}</p>
                    {req.classroomUnit && (
                      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginTop: 2 }}>
                        {req.classroomUnit.department?.name} · {req.classroomUnit.session?.name}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="primary" size="sm" icon={<CheckCircle size={14} />} loading={approving} onClick={() => handleApprove(req.id)}>
                      Approve
                    </Button>
                    <Button variant="ghost" size="sm" loading={rejecting} onClick={() => handleReject(req.id)} style={{ color: "#dc2626" }}>
                      <XCircle size={14} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Structure Setup ──────────────────────────────────────────────── */}
      {activeTab === "structure" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                College Hierarchy
              </h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
                Click a college to expand its departments and classroom units. Students need at least one unit to register.
              </p>
            </div>
            <Button
              variant="accent"
              size="sm"
              icon={<Sparkles size={14} />}
              onClick={() => { setShowBootstrapModal(true); setBootstrapStep(0); }}
            >
              Bootstrap New College
            </Button>
          </div>

          {/* College accordion list */}
          {colleges.length === 0 ? (
            <Card padding="lg" style={{ textAlign: "center" }}>
              <Building2 size={36} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 16 }}>No colleges yet.</p>
              <Button variant="accent" size="sm" icon={<Sparkles size={14} />} onClick={() => setShowBootstrapModal(true)}>
                Bootstrap First College
              </Button>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {colleges.map((college) => {
                const isOpen = expandedCollegeId === college.id;
                // Departments for this college (only loaded when expanded)
                const depts = isOpen ? expandedCollegeDepts : [];

                return (
                  <Card key={college.id} padding="none" style={{ overflow: "hidden" }}>
                    {/* College header */}
                    <button
                      onClick={() => setExpandedCollegeId(isOpen ? null : college.id)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Building2 size={18} style={{ color: "var(--default-color)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text)" }}>{college.name}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 2 }}>ID: {college.id.slice(0, 12)}…</p>
                      </div>
                      {isOpen ? <ChevronDown size={16} style={{ color: "var(--text-subtle)" }} /> : <ChevronRight size={16} style={{ color: "var(--text-subtle)" }} />}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ padding: "0 20px 18px", borderTop: "1px solid var(--border)" }}>
                            {depts.length === 0 ? (
                              <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", padding: "16px 0", textAlign: "center" }}>
                                No departments yet.
                              </p>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                                {depts.map((dept) => {
                                  // Find all classroom units under this department
                                  const deptUnits = (treeUnits as any[]).filter(
                                    (u: any) => u.departmentId === dept.id || u.department?.id === dept.id
                                  );

                                  return (
                                    <div key={dept.id} style={{ background: "var(--surface-glass-dark)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                                      {/* Department row */}
                                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: deptUnits.length > 0 ? 10 : 0 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(143,191,159,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                          <GraduationCap size={14} style={{ color: "var(--secondary)" }} />
                                        </div>
                                        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", flex: 1 }}>{dept.name}</p>
                                        <button
                                          onClick={() => {
                                            setAddSessionDeptId(dept.id);
                                            setAddSessionDeptName(dept.name);
                                            setAddSessionLabel("");
                                            setAddSessionError("");
                                            setShowAddSessionModal(true);
                                          }}
                                          title="Add new session (classroom unit)"
                                          style={{
                                            display: "flex", alignItems: "center", gap: 4,
                                            fontSize: "0.73rem", fontWeight: 700, color: "var(--default-color)",
                                            background: "rgba(143,191,159,0.12)", border: "1px solid var(--border)",
                                            borderRadius: "var(--radius-full)", padding: "3px 10px", cursor: "pointer",
                                          }}
                                        >
                                          <Plus size={11} /> Add Session
                                        </button>
                                      </div>

                                      {/* Classroom unit chips */}
                                      {deptUnits.length > 0 && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 38 }}>
                                          {deptUnits.map((u: any) => (
                                            <span
                                              key={u.id}
                                              style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                fontSize: "0.72rem", fontWeight: 600,
                                                background: "rgba(143,191,159,0.12)", color: "var(--default-color)",
                                                border: "1px solid rgba(143,191,159,0.3)",
                                                borderRadius: "var(--radius-full)", padding: "3px 10px",
                                              }}
                                            >
                                              <Layers size={10} /> {u.session?.name ?? u.sessionId}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Bootstrap Wizard */}
      <AnimatePresence>
        {showBootstrapModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,15,15,0.6)", backdropFilter: "blur(8px)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              style={{ width: "100%", maxWidth: 500, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 32, boxShadow: "var(--shadow-lg)" }}
            >
              {/* Wizard header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={18} style={{ color: "var(--default-color)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Bootstrap College</h3>
                    <p style={{ fontSize: "0.73rem", color: "var(--text-subtle)" }}>Step {bootstrapStep + 1} of 3</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowBootstrapModal(false); setBootstrapStep(0); setBootstrapError(""); }}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step progress bar */}
              <div style={{ display: "flex", gap: 6, margin: "16px 0 24px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= bootstrapStep ? "var(--default-color)" : "var(--border)", transition: "background 0.3s" }} />
                ))}
              </div>

              {/* Step 1: College Name */}
              {bootstrapStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4 }}>College Name</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 12 }}>
                      If this college already exists, it will be reused and a new department added to it.
                    </p>
                    <Input
                      label=""
                      id="bs-college"
                      value={bootstrapCollegeName}
                      onChange={(e) => setBootstrapCollegeName(e.target.value)}
                      placeholder="e.g. Faculty of Engineering"
                    />
                    {colleges.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", marginBottom: 6 }}>Existing colleges:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {colleges.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => setBootstrapCollegeName(c.name)}
                              style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: "var(--radius-full)", border: "1px solid var(--border)", background: bootstrapCollegeName === c.name ? "var(--default-color)" : "transparent", color: bootstrapCollegeName === c.name ? "#fff" : "var(--text-muted)", cursor: "pointer" }}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="accent" disabled={bootstrapCollegeName.trim().length < 2} onClick={() => setBootstrapStep(1)}>Next →</Button>
                  </div>
                </div>
              )}

              {/* Step 2: Department Name */}
              {bootstrapStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4 }}>Department Name</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 12 }}>
                      Under <strong>{bootstrapCollegeName}</strong>. Must be unique within that college.
                    </p>
                    <Input
                      label=""
                      id="bs-dept"
                      value={bootstrapDeptName}
                      onChange={(e) => setBootstrapDeptName(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                    <Button variant="ghost" onClick={() => setBootstrapStep(0)}>← Back</Button>
                    <Button variant="accent" disabled={bootstrapDeptName.trim().length < 2} onClick={() => setBootstrapStep(2)}>Next →</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Session Label + Preview + Submit */}
              {bootstrapStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 4 }}>Session Label</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 12 }}>
                      The academic year / batch label students will see, e.g. <em>2024-25</em>, <em>Fall 2026</em>, <em>Batch 12</em>.
                    </p>
                    <Input
                      label=""
                      id="bs-session"
                      value={bootstrapSession}
                      onChange={(e) => setBootstrapSession(e.target.value)}
                      placeholder="e.g. 2024-25"
                    />
                  </div>

                  {/* Preview card */}
                  {bootstrapSession.trim() && (
                    <div style={{ background: "rgba(143,191,159,0.08)", border: "1px solid rgba(143,191,159,0.3)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--default-color)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Will create:</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <span>🏛️ College — <strong style={{ color: "var(--text)" }}>{bootstrapCollegeName}</strong></span>
                        <span style={{ paddingLeft: 16 }}>🎓 Department — <strong style={{ color: "var(--text)" }}>{bootstrapDeptName}</strong></span>
                        <span style={{ paddingLeft: 32 }}>📚 Semester & Course (General) — <strong style={{ color: "var(--text)" }}>{bootstrapSession}</strong></span>
                        <span style={{ paddingLeft: 48 }}>🏫 Classroom Unit — <strong style={{ color: "var(--default-color)" }}>{bootstrapDeptName} · {bootstrapSession}</strong></span>
                      </div>
                    </div>
                  )}

                  {bootstrapError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{bootstrapError}</p>}

                  <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                    <Button variant="ghost" onClick={() => { setBootstrapStep(1); setBootstrapError(""); }}>← Back</Button>
                    <Button
                      variant="accent"
                      loading={bootstrapping}
                      disabled={bootstrapSession.trim().length < 1}
                      onClick={() => handleBootstrap()}
                      icon={<Sparkles size={14} />}
                    >
                      Create Everything
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Session Modal */}
      <AnimatePresence>
        {showAddSessionModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,15,15,0.6)", backdropFilter: "blur(8px)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ width: "100%", maxWidth: 440, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28, boxShadow: "var(--shadow-lg)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(143,191,159,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Layers size={16} style={{ color: "var(--default-color)" }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 800 }}>Add Session</h3>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>{addSessionDeptName}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAddSessionModal(false); setAddSessionError(""); }}
                  style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
                Creates a new <strong>Semester → Course → Session → Classroom Unit</strong> under <strong>{addSessionDeptName}</strong>.
                Students will be able to select this unit during registration.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Input
                  label="Session Label"
                  id="add-session-label"
                  value={addSessionLabel}
                  onChange={(e) => setAddSessionLabel(e.target.value)}
                  placeholder="e.g. 2025-26 or Spring 2027"
                />
                {addSessionError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{addSessionError}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => { setShowAddSessionModal(false); setAddSessionError(""); }}>Cancel</Button>
                  <Button
                    variant="accent"
                    loading={addingSession}
                    disabled={addSessionLabel.trim().length < 1}
                    onClick={() => handleAddSession()}
                    icon={<Plus size={14} />}
                  >
                    Add Session
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create College & Resource Chain */}
      <AnimatePresence>
        {showCreateCollegeModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 500, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Create College & Resource Chain</h3>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-subtle)", marginTop: 4 }}>Step {createCollegeStep + 1} of 3</p>
                </div>
                <button onClick={() => { setShowCreateCollegeModal(false); setCreateCollegeStep(0); setCreateCollegeError(""); }} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", gap: 6, margin: "12px 0 20px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= createCollegeStep ? "var(--default-color)" : "var(--border)", transition: "background 0.3s" }} />
                ))}
              </div>

              {createCollegeStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 6 }}>College Name</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>
                      This will create the college and its first branch of resources automatically.
                    </p>
                    <Input label="" value={newCollegeName} onChange={(e) => setNewCollegeName(e.target.value)} placeholder="e.g. Faculty of Engineering" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="accent" disabled={newCollegeName.trim().length < 2} onClick={() => setCreateCollegeStep(1)}>Next →</Button>
                  </div>
                </div>
              )}

              {createCollegeStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 6 }}>Department Name</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>
                      The department will be created under <strong>{newCollegeName}</strong>.
                    </p>
                    <Input label="" value={createDepartmentName} onChange={(e) => setCreateDepartmentName(e.target.value)} placeholder="e.g. Computer Science & Engineering" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Button variant="ghost" onClick={() => setCreateCollegeStep(0)}>← Back</Button>
                    <Button variant="accent" disabled={createDepartmentName.trim().length < 2} onClick={() => setCreateCollegeStep(2)}>Next →</Button>
                  </div>
                </div>
              )}

              {createCollegeStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 6 }}>Session Label</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>
                      A semester, general course, session, and classroom unit will be created for this label.
                    </p>
                    <Input label="" value={createSessionLabel} onChange={(e) => setCreateSessionLabel(e.target.value)} placeholder="e.g. 2024-25 or Fall 2026" />
                  </div>

                  <div style={{ background: "rgba(143,191,159,0.08)", border: "1px solid rgba(143,191,159,0.3)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--default-color)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Will create</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      <span>🏛️ College — <strong style={{ color: "var(--text)" }}>{newCollegeName || "College name"}</strong></span>
                      <span style={{ paddingLeft: 16 }}>🎓 Department — <strong style={{ color: "var(--text)" }}>{createDepartmentName || "Department name"}</strong></span>
                      <span style={{ paddingLeft: 32 }}>📚 Semester & General Course — <strong style={{ color: "var(--text)" }}>{createSessionLabel || "Session label"}</strong></span>
                      <span style={{ paddingLeft: 48 }}>🏫 Classroom Unit — <strong style={{ color: "var(--default-color)" }}>{createDepartmentName || "Department"} · {createSessionLabel || "Session"}</strong></span>
                    </div>
                  </div>

                  {createCollegeError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{createCollegeError}</p>}

                  <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                    <Button variant="ghost" onClick={() => { setCreateCollegeStep(1); setCreateCollegeError(""); }}>← Back</Button>
                    <Button variant="accent" loading={creatingCollege} disabled={createSessionLabel.trim().length < 1} onClick={() => handleCreateCollegeChain()} icon={<Plus size={14} />}>
                      Create Everything
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promote Sub Admin */}
      <AnimatePresence>
        {showPromoteSubModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 440, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Promote Sub Admin</h3>
                <button onClick={() => { setShowPromoteSubModal(false); setError(""); }} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Student User ID (CUID)" value={subUserId} onChange={(e) => setSubUserId(e.target.value)} placeholder="Enter CUID of verified user" />
                <div>
                  <label className="input-label">College</label>
                  <select value={subCollegeId} onChange={(e) => setSubCollegeId(e.target.value)} className="input-field">
                    <option value="">Select College</option>
                    {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => { setShowPromoteSubModal(false); setError(""); }}>Cancel</Button>
                  <Button variant="accent" loading={promotingSub} onClick={() => handlePromoteSub()}>Promote</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promote CR (owner fallback) */}
      <AnimatePresence>
        {showPromoteCRModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 500, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800 }}>Promote CR (Owner Fallback)</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Use only when the college&apos;s Sub Admin is unavailable</p>
                </div>
                <button onClick={() => { setShowPromoteCRModal(false); setCrError(""); }} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Student User ID (CUID)" value={crUserId} onChange={(e) => setCrUserId(e.target.value)} placeholder="Enter CUID of verified student" />
                <div>
                  <label className="input-label">Classroom Unit</label>
                  <select value={crUnitId} onChange={(e) => setCrUnitId(e.target.value)} className="input-field">
                    <option value="">Select Classroom Unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.department?.name ?? "Dept"} · {u.session?.name ?? "Session"} ({u.id.slice(0, 8)}…)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">CR Seat</label>
                  <select value={crSeat} onChange={(e) => setCrSeat(e.target.value as CrSeat)} className="input-field">
                    <option value="MAIN">Main CR (Primary)</option>
                    <option value="CO">Co-CR (Secondary)</option>
                  </select>
                </div>
                {crError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{crError}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => { setShowPromoteCRModal(false); setCrError(""); }}>Cancel</Button>
                  <Button variant="accent" loading={promotingCR} disabled={!crUserId.trim() || !crUnitId} onClick={() => handlePromoteCR()}>Promote to CR</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Ownership */}
      <AnimatePresence>
        {showTransferModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 460, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldAlert size={20} /> Transfer Ownership
                </h3>
                <button onClick={() => setShowTransferModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16 }}>
                Warning: This action is irreversible. You will immediately lose Owner Admin privileges and revert to a standard user.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="New Owner User ID (CUID)" value={transferUserId} onChange={(e) => setTransferUserId(e.target.value)} placeholder="Enter CUID of new owner" />
                <Input label="Type 'TRANSFER' to confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="TRANSFER" />
                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => setShowTransferModal(false)}>Cancel</Button>
                  <Button variant="accent" disabled={confirmText !== "TRANSFER" || !transferUserId.trim()} loading={transferring} onClick={() => handleTransfer()} style={{ background: "#dc2626" }}>
                    Confirm Transfer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
