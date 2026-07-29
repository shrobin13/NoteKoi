"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, ArrowRight, BookOpen } from "lucide-react";
import { getColleges } from "@/lib/hierarchy";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function CollegesListPage() {
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Colleges", href: "/college" }]);
  }, [setBreadcrumbs]);

  const { data, isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => getColleges(1, 100),
  });

  const colleges = data?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
          Academic Colleges
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Select a college to explore its departments, semesters, and courses
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : colleges.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No colleges found.</p>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {colleges.map((c) => (
            <motion.div key={c.id} variants={item}>
              <Link href={`/college/${c.id}`} style={{ textDecoration: "none" }}>
                <Card hover padding="lg">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(143,191,159,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Building2 size={20} style={{ color: "var(--default-color)" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
                    {c.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--default-color)" }}>Explore Departments</span>
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
