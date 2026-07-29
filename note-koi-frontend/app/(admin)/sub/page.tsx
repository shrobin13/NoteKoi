"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Users, FileText, ShieldCheck, CheckSquare, Plus } from "lucide-react";
import { getPendingVerifications } from "@/lib/verification";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SubAdminDashboardPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Sub Admin Dashboard", href: "/admin/sub" }]);
  }, [setBreadcrumbs]);

  const { data: pendingData } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: () => getPendingVerifications(1, 50),
  });

  const pending = pendingData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8,
          }}>
            Sub Admin Portal
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            College-wide governance and CR appointment
          </p>
        </div>
        <Badge variant="SUB_ADMIN">College Scope</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
        {[
          { icon: <Building2 size={20} />, label: "Assigned College", value: "Primary", color: "var(--default-color)" },
          { icon: <CheckSquare size={20} />, label: "College Verifications", value: pending.length, color: "var(--accent)" },
          { icon: <ShieldCheck size={20} />, label: "Active CRs", value: "Managed", color: "var(--secondary)" },
        ].map((stat) => (
          <Card key={stat.label} padding="lg">
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "var(--radius-sm)",
                background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center",
                color: stat.color, flexShrink: 0,
              }}>
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
        ))}
      </div>

      <Card padding="lg">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          College Verifications (Fallback Queue)
        </h3>
        {pending.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No unassigned verifications requiring Sub Admin fallback.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.map((req) => (
              <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--surface-glass-dark)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{req.user?.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{req.user?.email}</p>
                </div>
                <Badge variant="UNVERIFIED">Pending</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
