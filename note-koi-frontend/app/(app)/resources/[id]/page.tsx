"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, ExternalLink, Eye, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getResource } from "@/lib/resources";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";

export default function ResourceViewerPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useUIStore();
  const { user } = useAuthStore();

  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResource(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (resource) {
      setBreadcrumbs([
        { label: "Explore", href: "/explore" },
        { label: resource.title, href: `/resources/${id}` },
      ]);
    }
  }, [resource, id, setBreadcrumbs]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Skeleton height="32px" width="200px" style={{ marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
          <Skeleton height="600px" className="rounded-2xl" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton height="24px" width="80%" />
            <Skeleton height="48px" />
            <Skeleton height="48px" />
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <FileText size={48} style={{ color: "var(--text-subtle)", margin: "0 auto 16px" }} />
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>Resource not found</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 24 }}>
          This resource may be private or unavailable.
        </p>
        <Link href="/explore" className="btn btn-primary">Back to Explorer</Link>
      </div>
    );
  }

  const canPreview = !!resource.previewUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{ maxWidth: 1100, margin: "0 auto" }}
    >
      {/* Back */}
      <Link
        href="/explore"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: "0.83rem", fontWeight: 600, color: "var(--text-muted)",
          marginBottom: 24, textDecoration: "none",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--default-color)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
      >
        <ArrowLeft size={14} /> Back to Explorer
      </Link>

      <div style={{
        display: "grid",
        gridTemplateColumns: canPreview ? "1fr 320px" : "1fr",
        gap: 28,
        alignItems: "start",
      }}>
        {/* PDF Preview */}
        {canPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 28 }}
            style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              background: "#1a1a1a",
              aspectRatio: "4/5",
            }}
          >
            <iframe
              src={resource.previewUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title={`Preview: ${resource.title}`}
              allow="autoplay"
            />
          </motion.div>
        )}

        {/* Info sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Resource card */}
          <div style={{
            background: "var(--surface-elevated)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow-md), var(--shadow-glow)",
            padding: 28,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Top accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3,
              background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 60%, var(--accent) 100%)",
            }} />

            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(143,191,159,0.2), rgba(104,166,125,0.1))",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <FileText size={24} style={{ color: "var(--default-color)" }} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <Badge variant={resource.category}>{resource.category}</Badge>
              <Badge variant={resource.visibility}>{resource.visibility}</Badge>
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
              marginBottom: 20,
            }}>
              {resource.title}
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href={resource.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Download size={16} /> Download File
              </a>

              {resource.previewUrl && (
                <a
                  href={resource.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <ExternalLink size={16} /> Open in Drive
                </a>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div style={{
            background: "var(--surface-elevated)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
            padding: "20px 24px",
          }}>
            <h4 style={{
              fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", color: "var(--text-subtle)", marginBottom: 14,
            }}>
              Details
            </h4>
            {[
              { label: "Category", value: resource.category },
              { label: "Visibility", value: resource.visibility },
              ...(resource.createdAt ? [{ label: "Added", value: new Date(resource.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }] : []),
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "0.83rem",
                }}
              >
                <span style={{ color: "var(--text-subtle)", fontWeight: 500 }}>{label}</span>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
