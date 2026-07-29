"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart3, Users, Building2, BookOpen, FileText, Crown, ShieldAlert } from "lucide-react";
import { getAdminStats, getSubAdmins } from "@/lib/admin";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

export default function OwnerDashboardPage() {
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Owner Dashboard", href: "/admin/owner" }]);
  }, [setBreadcrumbs]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const { data: subAdmins } = useQuery({
    queryKey: ["sub-admins"],
    queryFn: getSubAdmins,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8,
          }}>
            Platform Governance
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Platform-wide system metrics, Sub Admin assignments, and analytics
          </p>
        </div>
        <Badge variant="OWNER_ADMIN">Owner Scope</Badge>
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
          <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>{subAdmins?.length ?? 0} assigned</span>
        </div>

        {subAdmins && subAdmins.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {subAdmins.map((sub) => (
              <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--surface-glass-dark)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{sub.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{sub.email}</p>
                </div>
                <Badge variant="SUB_ADMIN">{sub.collegeId ?? "Assigned"}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>No sub admins promoted yet.</p>
        )}
      </Card>
    </motion.div>
  );
}
