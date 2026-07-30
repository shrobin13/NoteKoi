"use client";
import { useEffect, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Download, Eye, ExternalLink, ArrowLeft, Lock, Globe } from "lucide-react";
import { getResource } from "@/lib/resources";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";

export default function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { setBreadcrumbs } = useUIStore();

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => getResource(id),
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Explore", href: "/explore" },
      { label: resource?.title ?? "Resource", href: `/resources/${id}` },
    ]);
  }, [setBreadcrumbs, resource, id]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <ResourceCardSkeleton />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Lock size={48} style={{ color: "var(--accent)", margin: "0 auto 16px" }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, marginBottom: 8 }}>
          Access Restricted
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          This resource is private to verified students of its classroom unit, or does not exist.
        </p>
        <Link href="/explore">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>Back to Explore</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Top action */}
      <Link href="/explore" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-subtle)", textDecoration: "none", marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Library
      </Link>

      <Card padding="lg" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Badge variant={resource.category}>{resource.category}</Badge>
            <Badge variant={resource.visibility}>{resource.visibility}</Badge>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
            {new Date(resource.createdAt ?? "").toLocaleDateString()}
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 16 }}>
          {resource.title}
        </h1>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" icon={<Download size={16} />}>
              Download File
            </Button>
          </a>
          {resource.previewUrl && (
            <a href={resource.previewUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" icon={<ExternalLink size={16} />}>
                Open Google Drive Preview
              </Button>
            </a>
          )}
        </div>
      </Card>

      {/* Embedded PDF/Drive preview if available */}
      {resource.previewUrl ? (
        <Card padding="none" style={{ overflow: "hidden", height: 600 }}>
          <iframe
            src={resource.previewUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={resource.title}
          />
        </Card>
      ) : (
        <Card padding="lg" style={{ textAlign: "center", background: "var(--surface-glass-dark)" }}>
          <Eye size={36} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            In-browser preview is available via Google Drive. Click above to open the file link directly.
          </p>
        </Card>
      )}
    </motion.div>
  );
}
