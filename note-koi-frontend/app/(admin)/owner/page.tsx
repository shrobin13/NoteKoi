"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Building2, BookOpen, FileText, Crown, ShieldAlert,
  Plus, Trash2, X, CheckCircle, XCircle, UserPlus, LayoutGrid,
  ShieldCheck, ChevronDown, ChevronRight,
} from "lucide-react";
import { getAdminStats, getSubAdmins, promoteSubAdmin, demoteSubAdmin, transferOwnership, getCRs, assignCR, demoteCR } from "@/lib/admin";
import { createCollege, getColleges, getClassroomUnits } from "@/lib/hierarchy";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/lib/verification";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import type { CrSeat, CRMember } from "@/lib/types";

type ActiveTab = "overview" | "subadmins" | "crs" | "verifications";

export default function OwnerDashboardPage() {
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Sub Admin modals
  const [showPromoteSubModal, setShowPromoteSubModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCreateCollegeModal, setShowCreateCollegeModal] = useState(false);
  const [subUserId, setSubUserId] = useState("");
  const [subCollegeId, setSubCollegeId] = useState("");
  const [newCollegeName, setNewCollegeName] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  // CR promotion (owner admin fallback)
  const [showPromoteCRModal, setShowPromoteCRModal] = useState(false);
  const [crUserId, setCrUserId] = useState("");
  const [crUnitId, setCrUnitId] = useState("");
  const [crSeat, setCrSeat] = useState<CrSeat>("PRIMARY");
  const [crError, setCrError] = useState("");
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [transferUserId, setTransferUserId] = useState("");

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
    queryFn: getClassroomUnits,
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

  const colleges = collegesData?.data ?? [];
  const units = allUnits ?? [];
  const pending = pendingData?.data ?? [];

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

  const { mutate: handleCreateCollege, isPending: creatingCollege } = useMutation({
    mutationFn: () => createCollege(newCollegeName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      queryClient.invalidateQueries({ queryKey: ["colleges-list"] });
      setShowCreateCollegeModal(false);
      setNewCollegeName(""); setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to create college");
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
          <Button variant="secondary" size="sm" icon={<Plus size={15} />} onClick={() => setShowCreateCollegeModal(true)}>
            Create College
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
                                    <Badge variant={cr.crSeat === "PRIMARY" ? "CR" : "admin"}>{cr.crSeat === "PRIMARY" ? "Main CR" : "Co-CR"}</Badge>
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

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Create College */}
      <AnimatePresence>
        {showCreateCollegeModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 420, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Create New College</h3>
                <button onClick={() => setShowCreateCollegeModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="College Name" value={newCollegeName} onChange={(e) => setNewCollegeName(e.target.value)} placeholder="e.g. Faculty of Engineering" />
                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => setShowCreateCollegeModal(false)}>Cancel</Button>
                  <Button variant="accent" loading={creatingCollege} onClick={() => handleCreateCollege()} disabled={!newCollegeName.trim()}>Create</Button>
                </div>
              </div>
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
                    <option value="PRIMARY">Main CR (Primary)</option>
                    <option value="SECONDARY">Co-CR (Secondary)</option>
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
