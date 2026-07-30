"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, BookOpen, FileText, Crown, ShieldAlert, Plus, Trash2, X } from "lucide-react";
import { getAdminStats, getSubAdmins, promoteSubAdmin, demoteSubAdmin, transferOwnership } from "@/lib/admin";
import { getColleges } from "@/lib/hierarchy";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

export default function OwnerDashboardPage() {
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [userId, setUserId] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

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

  const { mutate: handlePromote, isPending: promoting } = useMutation({
    mutationFn: () => promoteSubAdmin(userId, collegeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-admins"] });
      setShowPromoteModal(false);
      setUserId("");
      setCollegeId("");
      setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to promote Sub Admin");
    },
  });

  const { mutate: handleDemote } = useMutation({
    mutationFn: (targetUserId: string) => demoteSubAdmin(targetUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sub-admins"] }),
  });

  const { mutate: handleTransfer, isPending: transferring } = useMutation({
    mutationFn: () => transferOwnership(userId),
    onSuccess: () => {
      setShowTransferModal(false);
      window.location.href = "/dashboard";
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to transfer ownership");
    },
  });

  const colleges = collegesData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Platform Governance
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Platform-wide system metrics, Sub Admin assignments, and ownership transfer
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge variant="OWNER_ADMIN">Owner Scope</Badge>
          <Button variant="accent" icon={<Plus size={16} />} onClick={() => setShowPromoteModal(true)}>
            Promote Sub Admin
          </Button>
          <Button variant="ghost" icon={<Crown size={16} />} onClick={() => setShowTransferModal(true)} style={{ color: "#dc2626" }}>
            Transfer Ownership
          </Button>
        </div>
      </div>

      {/* Platform Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
        {isLoading ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          [
            { icon: <Users size={20} />, label: "Total Users", value: stats?.totalUsers ?? 0, color: "var(--default-color)" },
            { icon: <Building2 size={20} />, label: "Colleges", value: stats?.totalColleges ?? 0, color: "var(--secondary)" },
            { icon: <BookOpen size={20} />, label: "Departments", value: stats?.totalDepartments ?? 0, color: "var(--accent)" },
            { icon: <FileText size={20} />, label: "Resources", value: stats?.totalResources ?? 0, color: "var(--default-color)" },
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

      {/* Active Sub Admins */}
      <Card padding="lg">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700 }}>
            Active Sub Admins
          </h3>
          <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>{subAdmins.length} assigned</span>
        </div>

        {subAdmins.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subAdmins.map((sub) => (
              <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--surface-glass-dark)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{sub.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{sub.email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Badge variant="SUB_ADMIN">{sub.collegeId ?? "Assigned"}</Badge>
                  <button onClick={() => handleDemote(sub.id)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#dc2626" }} title="Demote Sub Admin">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No sub admins promoted yet.</p>
        )}
      </Card>

      {/* Promote Modal */}
      <AnimatePresence>
        {showPromoteModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 440, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Promote Sub Admin</h3>
                <button onClick={() => setShowPromoteModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Student User ID (CUID)" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter CUID of student" />
                <div>
                  <label className="input-label">College</label>
                  <select value={collegeId} onChange={(e) => setCollegeId(e.target.value)} className="input-field">
                    <option value="">Select College</option>
                    {colleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => setShowPromoteModal(false)}>Cancel</Button>
                  <Button variant="accent" loading={promoting} onClick={() => handlePromote()}>Promote</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Ownership Modal */}
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
                <Input label="New Owner User ID (CUID)" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter CUID of new owner" />
                <Input label="Type 'TRANSFER' to confirm" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="TRANSFER" />
                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => setShowTransferModal(false)}>Cancel</Button>
                  <Button variant="accent" disabled={confirmText !== "TRANSFER"} loading={transferring} onClick={() => handleTransfer()} style={{ background: "#dc2626" }}>
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
