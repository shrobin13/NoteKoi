"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Filter, FileText, Download, Eye, ArrowRight, X } from "lucide-react";
import { getPublicResources } from "@/lib/resources";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";
import { PdfViewerModal } from "@/components/ui/PdfViewerModal";
import { useUIStore } from "@/store/ui";
import type { Resource, ResourceCategory } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";

const CATEGORIES: ResourceCategory[] = ["Lecture", "Notes", "PYQ", "Tutorial", "Software", "Other"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function ExplorePage() {
  const { setBreadcrumbs } = useUIStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ResourceCategory | "">("");
  const [page, setPage] = useState(1);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    setBreadcrumbs([{ label: "Explore", href: "/explore" }]);
  }, [setBreadcrumbs]);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, category]);

  const { data, isLoading } = useQuery({
    queryKey: ["public-resources", debouncedSearch, category, page],
    queryFn: () =>
      getPublicResources({
        search: debouncedSearch || undefined,
        category: category || undefined,
        page,
        limit: 12,
      }),
  });

  const resources = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }} style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text)",
          marginBottom: 8,
        }}>
          Explore Resources
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Browse the public academic library — no login required
          {meta && <span style={{ fontWeight: 600, color: "var(--default-color)" }}> · {meta.total} resources</span>}
        </p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={16} style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "var(--text-subtle)", pointerEvents: "none",
          }} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, course..."
            id="explore-search"
            className="input-field"
            style={{ paddingLeft: 42 }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                lineHeight: 0, color: "var(--text-subtle)", cursor: "pointer",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ResourceCategory | "")}
          className="input-field"
          id="explore-category"
          style={{ minWidth: 160, cursor: "pointer" }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </motion.div>

      {/* Active filters */}
      {(search || category) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
        >
          {search && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: "var(--radius-full)",
              background: "var(--surface-glass-dark)", fontSize: "0.8rem",
              fontWeight: 600, color: "var(--default-color)",
            }}>
              "{search}"
              <button onClick={() => setSearch("")} style={{ lineHeight: 0, cursor: "pointer" }}>
                <X size={12} />
              </button>
            </span>
          )}
          {category && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: "var(--radius-full)",
              background: "var(--surface-glass-dark)", fontSize: "0.8rem",
              fontWeight: 600, color: "var(--default-color)",
            }}>
              {category}
              <button onClick={() => setCategory("")} style={{ lineHeight: 0, cursor: "pointer" }}>
                <X size={12} />
              </button>
            </span>
          )}
        </motion.div>
      )}

      {/* Resource Grid */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[...Array(12)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : resources.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <FileText size={48} style={{ color: "var(--text-subtle)", margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            No resources found
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Try adjusting your search or filters
          </p>
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
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "linear-gradient(135deg, rgba(143,191,159,0.2) 0%, rgba(104,166,125,0.1) 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FileText size={20} style={{ color: "var(--default-color)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Badge variant={res.category}>{res.category}</Badge>
                      <Badge variant={res.visibility}>{res.visibility}</Badge>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: "0.95rem", fontWeight: 700, color: "var(--text)",
                    fontFamily: "var(--font-display)", letterSpacing: "-0.01em",
                    lineHeight: 1.35, marginBottom: 12,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {res.title}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                      {new Date(res.createdAt ?? "").toLocaleDateString()}
                    </p>
                      <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                        {res.previewUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPreviewResource(res);
                            }}
                            style={{
                              display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem",
                              color: "var(--default-color)", fontWeight: 600, border: "none", background: "none", cursor: "pointer"
                            }}
                          >
                            <Eye size={12} /> Preview
                          </button>
                        )}
                        <ArrowRight size={14} style={{ color: "var(--text-subtle)" }} />
                      </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* PDF Viewer Modal */}
      {previewResource && (
        <PdfViewerModal
          open={!!previewResource}
          onClose={() => setPreviewResource(null)}
          title={previewResource.title}
          fileUrl={previewResource.fileUrl}
          previewUrl={previewResource.previewUrl}
        />
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)", padding: "0 12px" }}>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
