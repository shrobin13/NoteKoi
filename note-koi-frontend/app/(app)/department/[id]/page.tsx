"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { getDepartment, getSemesters } from "@/lib/hierarchy";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useUIStore();

  const { data: dept } = useQuery({
    queryKey: ["department", id],
    queryFn: () => getDepartment(id),
    enabled: !!id,
  });

  const { data: semesters, isLoading } = useQuery({
    queryKey: ["semesters", id],
    queryFn: () => getSemesters(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (dept) {
      setBreadcrumbs([
        { label: "Colleges", href: "/college" },
        { label: dept.name, href: `/department/${id}` },
      ]);
    }
  }, [dept, id, setBreadcrumbs]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
          {dept?.name ?? "Department"}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Semesters in this department</p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : !semesters || semesters.length === 0 ? (
        <Card padding="lg">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No semesters created for this department yet.</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {semesters.map((s) => (
            <motion.div key={s.id} variants={item}>
              <Link href={`/semester/${s.id}`} style={{ textDecoration: "none" }}>
                <Card hover padding="lg">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(241,143,1,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Layers size={20} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
                    {s.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent)" }}>View Courses</span>
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
