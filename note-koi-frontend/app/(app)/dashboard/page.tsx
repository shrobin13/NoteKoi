"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, BookOpen, CheckCircle, Clock, Users, ArrowRight,
  TrendingUp, BookMarked, Bell, Star,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { getPublicResources } from "@/lib/resources";
import { getPendingVerifications } from "@/lib/verification";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCardSkeleton, ResourceCardSkeleton } from "@/components/ui/Skeleton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard", href: "/dashboard" }]);
  }, [setBreadcrumbs]);

  const { data: resourcesData, isLoading: loadingResources } = useQuery({
    queryKey: ["public-resources", { limit: 6 }],
    queryFn: () => getPublicResources({ limit: 6 }),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: () => getPendingVerifications(1, 5),
    enabled: user?.role === "CR" || user?.role === "SUB_ADMIN" || user?.role === "OWNER_ADMIN",
  });

  const isUnverified = user?.status === "UNVERIFIED";
  const isCR = user?.role === "CR";
  const resources = resourcesData?.data ?? [];
  const pendingCount = pendingData?.meta?.total ?? 0;

  return (
    <div>
      {/* Unverified banner */}
      {isUnverified && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(241,143,1,0.08)",
            border: "1px solid rgba(241,143,1,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Clock size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#c87500" }}>
              Account Pending Verification
            </p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
              Your account is awaiting approval from a CR or Admin. You can still browse public resources.
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero greeting */}
      <motion.div variants={container} initial="hidden" animate="show" style={{ marginBottom: 40 }}>
        <motion.div variants={item}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text)",
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            Good {getTimeOfDay()},{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0] ?? "there"}</span> 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Here's what's happening in your knowledge universe today.
          </p>
        </motion.div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 40,
        }}
      >
        {[
          {
            icon: <FileText size={20} />,
            label: "Resources Available",
            value: resourcesData?.meta?.total ?? "—",
            sub: "Public library",
            color: "var(--default-color)",
          },
          {
            icon: <BookOpen size={20} />,
            label: "Public Courses",
            value: "∞",
            sub: "Explore freely",
            color: "var(--secondary)",
          },
          ...(isCR && pendingCount > 0
            ? [{
                icon: <Users size={20} />,
                label: "Pending Reviews",
                value: pendingCount,
                sub: "Awaiting your approval",
                color: "var(--accent)",
              }]
            : []),
          {
            icon: <CheckCircle size={20} />,
            label: "Account Status",
            value: user?.status === "VERIFIED" ? "Verified" : "Pending",
            sub: user?.role?.replace("_", " ").toLowerCase() ?? "student",
            color: user?.status === "VERIFIED" ? "var(--default-color)" : "var(--accent)",
          },
        ].map((stat, i) =>
          loadingResources ? (
            <StatCardSkeleton key={i} />
          ) : (
            <motion.div key={stat.label} variants={item}>
              <Card padding="lg" hover>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-sm)",
                      background: `${stat.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-display)", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: 4 }}>{stat.sub}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        )}
      </motion.div>

      {/* CR pending verifications */}
      {isCR && pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Pending Verifications
            </h2>
            <Link href="/admin/cr" className="btn btn-ghost btn-sm" style={{ color: "var(--default-color)" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <Card padding="none" hover={false}>
            {pendingData?.data?.slice(0, 3).map((req, i) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {req.user?.name?.charAt(0) ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)" }}>{req.user?.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{req.user?.email}</p>
                </div>
                <Badge variant="UNVERIFIED">Pending</Badge>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Recent resources */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              Latest Resources
            </h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)", marginTop: 2 }}>Recently added to the public library</p>
          </div>
          <Link href="/explore" className="btn btn-ghost btn-sm" style={{ color: "var(--default-color)" }}>
            Explore all <ArrowRight size={14} />
          </Link>
        </div>

        {loadingResources ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => <ResourceCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}
          >
            {resources.map((res) => (
              <motion.div key={res.id} variants={item}>
                <Link href={`/resources/${res.id}`} style={{ display: "block", textDecoration: "none" }}>
                  <Card hover>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: "linear-gradient(135deg, var(--primary)30, var(--secondary)20)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <FileText size={18} style={{ color: "var(--default-color)" }} />
                      </div>
                      <Badge variant={res.category}>{res.category}</Badge>
                    </div>
                    <h3 style={{
                      fontSize: "0.92rem", fontWeight: 700, color: "var(--text)",
                      fontFamily: "var(--font-display)", letterSpacing: "-0.01em",
                      lineHeight: 1.3, marginBottom: 8,
                      overflow: "hidden", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    }}>
                      {res.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge variant={res.visibility}>{res.visibility}</Badge>
                      <ArrowRight size={14} style={{ color: "var(--text-subtle)" }} />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
