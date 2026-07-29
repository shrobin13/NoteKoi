"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight, Building2 } from "lucide-react";
import { getCollege, getDepartments } from "@/lib/hierarchy";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useUIStore();

  const { data: college } = useQuery({
    queryKey: ["college", id],
    queryFn: () => getCollege(id),
    enabled: !!id,
  });

  const { data: deptsData, isLoading } = useQuery({
    queryKey: ["departments", id],
    queryFn: () => getDepartments(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (college) {
      setBreadcrumbs([
        { label: "Colleges", href: "/college" },
        { label: college.name, href: `/college/${id}` },
      ]);
    }
  }, [college, id, setBreadcrumbs]);

  const depts = deptsData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
          {college?.name ?? "College"}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Departments in this college</p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : depts.length === 0 ? (
        <Card padding="lg">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No departments found for this college yet.</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {depts.map((d) => (
            <motion.div key={d.id} variants={item}>
              <Link href={`/department/${d.id}`} style={{ textDecoration: "none" }}>
                <Card hover padding="lg">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(104,166,125,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <BookOpen size={20} style={{ color: "var(--default-color)" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
                    {d.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--default-color)" }}>Semesters</span>
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
