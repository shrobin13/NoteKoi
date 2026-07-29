"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Plus, ArrowRight, Eye, Download } from "lucide-react";
import { getCourse } from "@/lib/hierarchy";
import { getPublicResources, createResource } from "@/lib/resources";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";
import type { ResourceCategory, Visibility } from "@/lib/types";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } } };

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbs } = useUIStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("Notes");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [fileId, setFileId] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const isCR = user?.role === "CR" || user?.role === "SUB_ADMIN" || user?.role === "OWNER_ADMIN";

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourse(id),
    enabled: !!id,
  });

  const { data: resData, isLoading } = useQuery({
    queryKey: ["public-resources", { courseId: id }],
    queryFn: () => getPublicResources({ courseId: id, limit: 50 }),
    enabled: !!id,
  });

  useEffect(() => {
    if (course) {
      setBreadcrumbs([
        { label: "Semester", href: `/semester/${course.semesterId}` },
        { label: course.name, href: `/course/${id}` },
      ]);
    }
  }, [course, id, setBreadcrumbs]);

  const { mutate: handleUpload, isPending: uploading } = useMutation({
    mutationFn: async () => {
      return createResource({
        title,
        category,
        visibility,
        fileId,
        fileUrl,
        previewUrl: previewUrl || undefined,
        courseId: id,
        classroomUnitId: user?.classroomUnitId ?? "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-resources"] });
      setUploadOpen(false);
      setTitle(""); setFileId(""); setFileUrl(""); setPreviewUrl(""); setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to add resource.");
    },
  });

  const resources = resData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            {course?.name ?? "Course"}
          </h1>
          <p style={{ color: "var(--text-muted)" }}>Course study materials, lectures, notes and PYQs</p>
        </div>

        {isCR && (
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setUploadOpen(true)}>
            Add Resource
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {[...Array(6)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : resources.length === 0 ? (
        <Card padding="lg">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <FileText size={40} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 4 }}>No resources added yet</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              {isCR ? "Click 'Add Resource' to post notes or PYQs for your class." : "Check back soon for course materials."}
            </p>
          </div>
        </Card>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {resources.map((res) => (
            <motion.div key={res.id} variants={item}>
              <Link href={`/resources/${res.id}`} style={{ textDecoration: "none" }}>
                <Card hover>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(143,191,159,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FileText size={18} style={{ color: "var(--default-color)" }} />
                    </div>
                    <Badge variant={res.category}>{res.category}</Badge>
                  </div>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)", marginBottom: 8 }}>
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

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Add Course Resource">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Algorithms Lecture 1 Notes" required />

          <div>
            <label className="input-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ResourceCategory)} className="input-field" style={{ cursor: "pointer" }}>
              {["Lecture", "Notes", "PYQ", "Tutorial", "Software", "Other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Visibility</label>
            <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} className="input-field" style={{ cursor: "pointer" }}>
              <option value="PRIVATE">Private (Classroom Members Only)</option>
              <option value="PUBLIC">Public (All Users)</option>
            </select>
          </div>

          <Input label="Google Drive File ID" value={fileId} onChange={(e) => setFileId(e.target.value)} placeholder="e.g. 1gDriveFileIdSample" required />
          <Input label="Google Drive File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../view" required />
          <Input label="Preview URL (Optional)" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../preview" />

          {error && <p style={{ color: "#dc2626", fontSize: "0.83rem" }}>{error}</p>}

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleUpload()} loading={uploading}>Publish Resource</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
