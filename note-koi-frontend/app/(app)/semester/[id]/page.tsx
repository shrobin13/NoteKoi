"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookMarked, ArrowRight } from "lucide-react";
import { getSemester, getCourses } from "@/lib/hierarchy";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function SemesterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useUIStore();

  const { data: semester } = useQuery({
    queryKey: ["semester", id],
    queryFn: () => getSemester(id),
    enabled: !!id,
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", id],
    queryFn: () => getCourses(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (semester) {
      setBreadcrumbs([
        { label: "Department", href: `/department/${semester.departmentId}` },
        { label: semester.name, href: `/semester/${id}` },
      ]);
    }
  }, [semester, id, setBreadcrumbs]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
          {semester?.name ?? "Semester"}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Courses offered in this semester</p>
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {[...Array(4)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : !courses || courses.length === 0 ? (
        <Card padding="lg">
          <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No courses available in this semester yet.</p>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {courses.map((c) => (
            <motion.div key={c.id} variants={item}>
              <Link href={`/course/${c.id}`} style={{ textDecoration: "none" }}>
                <Card hover padding="lg">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(36,97,59,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <BookMarked size={20} style={{ color: "var(--default-color)" }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>
                    {c.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--default-color)" }}>Explore Resources</span>
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
