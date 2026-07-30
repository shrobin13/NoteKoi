"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShieldCheck, Users, CheckSquare, Building2, UserPlus, Clock } from "lucide-react";
import { getPendingVerifications } from "@/lib/verification";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

export default function SubAdminDashboardPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Sub Admin Dashboard", href: "/admin/sub" }]);
  }, [setBreadcrumbs]);

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["sub-pending-verifications"],
    queryFn: () => getPendingVerifications(1, 50),
    enabled: user?.role === "SUB_ADMIN" || user?.role === "OWNER_ADMIN",
  });

  const pending = pendingData?.data ?? [];
  const totalPending = pendingData?.meta?.total ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Sub Admin Control Room
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            College-scoped governance, CR appointments, and fallback verifications
          </p>
        </div>
        <Badge variant="admin">Sub Admin</Badge>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
        {isLoading ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          [
            { icon: <Building2 size={20} />, label: "Assigned College", value: user?.collegeId ?? "Assigned", color: "var(--default-color)" },
            { icon: <Clock size={20} />, label: "Fallback Verifications", value: totalPending, color: "var(--accent)" },
            { icon: <ShieldCheck size={20} />, label: "Role Authority", value: "Sub Admin", color: "var(--secondary)" },
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
                  <p style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "var(--font-display)", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Overview Card */}
      <Card padding="lg">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 12 }}>
          College Governance Overview
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
          As Sub Admin, you can promote verified Students to Class Representatives (Main CR / Co-CR) for any Department + Session in your college. You also serve as the fallback verification authority when a CR is not yet assigned.
        </p>
      </Card>
    </motion.div>
  );
}
