"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Clock, Building2, UserPlus, CheckCircle, XCircle,
  Users, LayoutGrid, X, ChevronDown, ChevronRight, Layers,
} from "lucide-react";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/lib/verification";
import { getCRs, assignCR, demoteCR } from "@/lib/admin";
import { getClassroomUnits } from "@/lib/hierarchy";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCardSkeleton, ResourceCardSkeleton } from "@/components/ui/Skeleton";
import type { CrSeat } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function SubAdminDashboardPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  // Modal state — Promote CR
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState("");
  const [promoteUnitId, setPromoteUnitId] = useState("");
  const [promoteSeat, setPromoteSeat] = useState<CrSeat>("PRIMARY");
  const [promoteError, setPromoteError] = useState("");

  // Expanded classroom unit (accordion)
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: "Sub Admin Dashboard", href: "/admin/sub" }]);
  }, [setBreadcrumbs]);

  const isSubAdmin = user?.role === "SUB_ADMIN";
  const isOwnerAdmin = user?.role === "OWNER_ADMIN";
  const canAct = isSubAdmin || isOwnerAdmin;

  // Pending verifications (scoped to college by backend)
  const { data: pendingData, isLoading: loadingPending } = useQuery({
    queryKey: ["sub-pending-verifications"],
    queryFn: () => getPendingVerifications(1, 50),
    enabled: canAct,
  });

  // All classroom units (backend scopes to sub admin's college)
  const { data: allUnits, isLoading: loadingUnits } = useQuery({
    queryKey: ["classroom-units"],
    queryFn: getClassroomUnits,
    enabled: canAct,
  });

  // CRs for the expanded unit
  const { data: unitCRs } = useQuery({
    queryKey: ["crs", expandedUnitId],
    queryFn: () => getCRs(expandedUnitId!),
    enabled: !!expandedUnitId,
  });

  const { mutate: handleApprove, isPending: approving } = useMutation({
    mutationFn: (id: string) => approveVerification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sub-pending-verifications"] }),
  });

  const { mutate: handleReject, isPending: rejecting } = useMutation({
    mutationFn: (id: string) => rejectVerification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sub-pending-verifications"] }),
  });

  const { mutate: handlePromote, isPending: promoting } = useMutation({
    mutationFn: () => assignCR({ userId: promoteUserId, classroomUnitId: promoteUnitId, seat: promoteSeat }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crs", promoteUnitId] });
      queryClient.invalidateQueries({ queryKey: ["crs", expandedUnitId] });
      setShowPromoteModal(false);
      setPromoteUserId("");
      setPromoteUnitId("");
      setPromoteError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setPromoteError(e?.response?.data?.message ?? "Failed to promote CR");
    },
  });

  const { mutate: handleDemote } = useMutation({
    mutationFn: (targetUserId: string) => demoteCR({ userId: targetUserId, classroomUnitId: expandedUnitId! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crs", expandedUnitId] }),
  });

  const pending = pendingData?.data ?? [];
  const totalPending = pendingData?.meta?.total ?? 0;
  const units = allUnits ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Sub Admin Control Room
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage CR appointments, verify students, and govern your college
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge variant="admin">Sub Admin</Badge>
          <Button
            variant="accent"
            icon={<UserPlus size={16} />}
            onClick={() => setShowPromoteModal(true)}
          >
            Promote CR
          </Button>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}
      >
        {loadingPending || loadingUnits ? (
          <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
        ) : (
          [
            { icon: <Building2 size={20} />, label: "Assigned College", value: user?.collegeId ? "Assigned" : "—", color: "var(--default-color)" },
            { icon: <Clock size={20} />, label: "Pending Verifications", value: totalPending, color: "var(--accent)" },
            { icon: <Layers size={20} />, label: "Classroom Units", value: units.length, color: "var(--secondary)" },
            { icon: <ShieldCheck size={20} />, label: "Authority", value: "Sub Admin", color: "var(--primary)" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <Card padding="lg">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>
                    {stat.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "var(--font-display)", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Fallback Verification Queue */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Fallback Verification Queue
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: 2 }}>
              Approve or reject students whose CR has not responded
            </p>
          </div>
          {totalPending > 0 && (
            <span style={{ fontSize: "0.78rem", background: "rgba(241,143,1,0.15)", color: "#c87500", borderRadius: "var(--radius-full)", padding: "4px 12px", fontWeight: 700 }}>
              {totalPending} pending
            </span>
          )}
        </div>

        {loadingPending ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(3)].map((_, i) => <ResourceCardSkeleton key={i} />)}
          </div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: 44, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
            <CheckCircle size={36} style={{ color: "var(--default-color)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No pending verification requests in your college.
            </p>
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
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Button variant="primary" size="sm" onClick={() => handleApprove(req.id)} loading={approving} icon={<CheckCircle size={14} />}>
                    Approve
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleReject(req.id)} loading={rejecting} style={{ color: "#dc2626", borderColor: "rgba(220,38,38,0.3)" }}>
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Classroom Units + CR Management */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
            Classroom Units & CR Assignments
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: 2 }}>
            Expand a unit to view, promote, or demote its Class Representatives
          </p>
        </div>

        {loadingUnits ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(4)].map((_, i) => <ResourceCardSkeleton key={i} />)}
          </div>
        ) : units.length === 0 ? (
          <Card padding="lg" style={{ textAlign: "center" }}>
            <LayoutGrid size={32} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No classroom units found for your college.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {units.map((unit) => {
              const isExpanded = expandedUnitId === unit.id;
              return (
                <Card key={unit.id} padding="none" style={{ overflow: "hidden" }}>
                  {/* Unit header row */}
                  <button
                    onClick={() => {
                      setExpandedUnitId(isExpanded ? null : unit.id);
                    }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 20px", background: "transparent", border: "none",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(143,191,159,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <LayoutGrid size={16} style={{ color: "var(--default-color)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>
                        {unit.department?.name ?? "Department"} · {unit.session?.name ?? "Session"}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                        Unit ID: {unit.id.slice(0, 8)}…
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, color: "var(--text-subtle)" }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {/* Expanded: CR list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 20px 16px", borderTop: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingTop: 14 }}>
                            <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              Class Representatives
                            </p>
                            <button
                              onClick={() => {
                                setPromoteUnitId(unit.id);
                                setShowPromoteModal(true);
                              }}
                              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.78rem", fontWeight: 700, color: "var(--default-color)", background: "rgba(143,191,159,0.15)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "4px 12px", cursor: "pointer" }}
                            >
                              <UserPlus size={12} /> Add CR
                            </button>
                          </div>

                          {!unitCRs || unitCRs.length === 0 ? (
                            <div style={{ padding: "16px 0", textAlign: "center" }}>
                              <Users size={24} style={{ color: "var(--text-subtle)", margin: "0 auto 8px" }} />
                              <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)" }}>No CRs assigned to this unit yet.</p>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {unitCRs.map((cr) => (
                                <div key={cr.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--surface-glass-dark)", borderRadius: "var(--radius-sm)" }}>
                                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                                    {cr.name?.charAt(0) ?? "?"}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>{cr.name}</p>
                                    <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>{cr.email}</p>
                                  </div>
                                  <Badge variant={cr.crSeat === "PRIMARY" ? "CR" : "admin"}>
                                    {cr.crSeat === "PRIMARY" ? "Main CR" : "Co-CR"}
                                  </Badge>
                                  <button
                                    onClick={() => handleDemote(cr.id)}
                                    title="Demote CR"
                                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "#dc2626", padding: 6 }}
                                  >
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
      </div>

      {/* Promote CR Modal */}
      <AnimatePresence>
        {showPromoteModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 500, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800 }}>Promote Class Representative</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Assign a verified student as Main CR or Co-CR for a classroom unit</p>
                </div>
                <button onClick={() => { setShowPromoteModal(false); setPromoteError(""); }} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input
                  label="Student User ID (CUID)"
                  value={promoteUserId}
                  onChange={(e) => setPromoteUserId(e.target.value)}
                  placeholder="Enter CUID of verified student"
                />

                <div>
                  <label className="input-label">Classroom Unit</label>
                  <select
                    value={promoteUnitId}
                    onChange={(e) => setPromoteUnitId(e.target.value)}
                    className="input-field"
                  >
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
                  <select
                    value={promoteSeat}
                    onChange={(e) => setPromoteSeat(e.target.value as CrSeat)}
                    className="input-field"
                  >
                    <option value="PRIMARY">Main CR (Primary)</option>
                    <option value="SECONDARY">Co-CR (Secondary)</option>
                  </select>
                </div>

                {/* Capacity note */}
                <div style={{ background: "rgba(143,191,159,0.08)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    ⚠️ Each classroom unit supports at most 2 CRs (1 Main + 1 Co-CR). The backend will reject promotion if seats are full.
                  </p>
                </div>

                {promoteError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{promoteError}</p>}

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => { setShowPromoteModal(false); setPromoteError(""); }}>Cancel</Button>
                  <Button
                    variant="accent"
                    loading={promoting}
                    disabled={!promoteUserId.trim() || !promoteUnitId}
                    onClick={() => handlePromote()}
                  >
                    Promote to CR
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
