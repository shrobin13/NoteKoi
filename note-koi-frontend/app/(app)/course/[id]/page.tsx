"use client";
import { useEffect, useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, FileText, MessageSquare, Bell, ArrowRight, Eye, Layers } from "lucide-react";
import { getCourse } from "@/lib/hierarchy";
import { getPublicResources } from "@/lib/resources";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { setBreadcrumbs } = useUIStore();
  const [activeTab, setActiveTab] = useState<"resources" | "overview">("resources");

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id),
  });

  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ["course-resources", id],
    queryFn: () => getPublicResources({ courseId: id, limit: 50 }),
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Colleges", href: "/college" },
      { label: course?.semester?.name ?? "Semester", href: course?.semesterId ? `/semester/${course.semesterId}` : "/college" },
      { label: course?.name ?? "Course", href: `/course/${id}` },
    ]);
  }, [setBreadcrumbs, course, id]);

  const resources = resourcesData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: "var(--radius-full)", background: "rgba(143,191,159,0.15)", border: "1px solid var(--border)", marginBottom: 12 }}>
          <BookOpen size={14} style={{ color: "var(--default-color)" }} />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--default-color)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Course Hub
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
          {course?.name ?? "Loading Course..."}
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Academic resources, notes, and materials for this course
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--border)", marginBottom: 28 }}>
        {[
          { key: "resources", label: "Resources", count: resources.length },
          { key: "overview", label: "Course Info" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "resources" | "overview")}
            style={{
              padding: "10px 16px",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.9rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: activeTab === tab.key ? "var(--default-color)" : "var(--text-muted)",
              borderBottom: activeTab === tab.key ? "2px solid var(--default-color)" : "2px solid transparent",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span style={{ fontSize: "0.72rem", background: "rgba(143,191,159,0.2)", color: "var(--default-color)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "resources" && (
        <div>
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {[...Array(6)].map((_, i) => <ResourceCardSkeleton key={i} />)}
            </div>
          ) : resources.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
              <FileText size={40} style={{ color: "var(--text-subtle)", margin: "0 auto 16px" }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                No resources uploaded yet
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                Class Representatives will add course materials here soon.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {resources.map((res) => (
                <Link key={res.id} href={`/resources/${res.id}`} style={{ textDecoration: "none" }}>
                  <Card hover padding="lg">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, rgba(143,191,159,0.2) 0%, rgba(104,166,125,0.1) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText size={18} style={{ color: "var(--default-color)" }} />
                      </div>
                      <Badge variant={res.category}>{res.category}</Badge>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 12, lineHeight: 1.35 }}>
                      {res.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge variant={res.visibility}>{res.visibility}</Badge>
                      <ArrowRight size={14} style={{ color: "var(--text-subtle)" }} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "overview" && (
        <Card padding="lg">
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 12 }}>About {course?.name}</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            This course is part of the academic curriculum under {course?.semester?.name ?? "its semester"}. Access all verified lecture notes, reference books, past year question papers (PYQs), and related software tools above.
          </p>
        </Card>
      )}
    </motion.div>
  );
}
