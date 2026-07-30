"use client";
import { useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutGrid, ArrowRight, Building2 } from "lucide-react";
import { getCollege, getDepartments } from "@/lib/hierarchy";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function CollegeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { setBreadcrumbs } = useUIStore();

  const { data: college } = useQuery({
    queryKey: ["college", id],
    queryFn: () => getCollege(id),
  });

  const { data: deptsData, isLoading } = useQuery({
    queryKey: ["departments", id],
    queryFn: () => getDepartments(id, 1, 100),
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Colleges", href: "/college" },
      { label: college?.name ?? "College", href: `/college/${id}` },
    ]);
  }, [setBreadcrumbs, college, id]);

  const departments = deptsData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: "var(--radius-full)", background: "rgba(143,191,159,0.15)", border: "1px solid var(--border)", marginBottom: 12 }}>
          <Building2 size={14} style={{ color: "var(--default-color)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--default-color)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            College Scope
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
          {college?.name ?? "Loading College..."}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Select a department to view curriculum & term resources
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : departments.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
          <LayoutGrid size={40} style={{ color: "var(--text-subtle)", margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            No departments found
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            No departments have been added to this college yet.
          </p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {departments.map((dept) => (
            <motion.div key={dept.id} variants={item}>
              <Link href={`/department/${dept.id}`} style={{ textDecoration: "none" }}>
                <Card hover padding="lg">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(143,191,159,0.2) 0%, rgba(104,166,125,0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <LayoutGrid size={20} style={{ color: "var(--default-color)" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
                    {dept.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--default-color)" }}>Explore Semesters</span>
                    <ArrowRight size={14} style={{ color: "var(--text-subtle)" }} />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
