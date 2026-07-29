"use client";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Clock, User, Users, CheckSquare } from "lucide-react";
import { getPendingVerifications, approveVerification } from "@/lib/verification";
import { getCRs } from "@/lib/admin";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

export default function CRDashboardPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs([{ label: "CR Dashboard", href: "/admin/cr" }]);
  }, [setBreadcrumbs]);

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: () => getPendingVerifications(1, 50),
  });

  const { data: crs } = useQuery({
    queryKey: ["crs", user?.classroomUnitId],
    queryFn: () => getCRs(user!.classroomUnitId!),
    enabled: !!user?.classroomUnitId,
  });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (requestId: string) => approveVerification(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-verifications"] }),
  });

  const pending = pendingData?.data ?? [];
  const total = pendingData?.meta?.total ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800,
          letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8,
        }}>
          CR Dashboard
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Manage verifications and your classroom unit
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16, marginBottom: 40,
      }}>
        {isLoading ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          <>
            {[
              {
                icon: <Clock size={20} />,
                label: "Pending Verifications",
                value: total,
                color: "var(--accent)",
              },
              {
                icon: <CheckSquare size={20} />,
                label: "Your Seat",
                value: user?.crSeat ?? "PRIMARY",
                color: "var(--default-color)",
              },
              {
                icon: <Users size={20} />,
                label: "CRs in Unit",
                value: crs?.length ?? "—",
                color: "var(--secondary)",
              },
            ].map((stat) => (
              <Card key={stat.label} padding="lg">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--radius-sm)",
                    background: `${stat.color}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
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
            ))}
          </>
        )}
      </div>

      {/* Verification queue */}
      <div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700,
          color: "var(--text)", marginBottom: 16,
        }}>
          Verification Queue
        </h2>

        {pending.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 60,
            background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
          }}>
            <CheckCircle size={40} style={{ color: "var(--default-color)", margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontWeight: 700, marginBottom: 8 }}>
              All clear!
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No pending verification requests right now.
            </p>
          </div>
        ) : (
          <div style={{
            background: "var(--surface-elevated)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}>
            {pending.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 24px",
                  borderBottom: i < pending.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {req.user?.name?.charAt(0) ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
                    {req.user?.name}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                    {req.user?.email}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-subtle)", marginTop: 2 }}>
                    Requested {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => approve(req.id)}
                  loading={approving}
                  icon={<CheckCircle size={14} />}
                  id={`approve-${req.id}`}
                >
                  Approve
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
