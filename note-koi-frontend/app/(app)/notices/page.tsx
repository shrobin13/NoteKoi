"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Pin, Clock, User, Plus, Trash2, Edit3, X, Megaphone } from "lucide-react";
import { getNotices, createNotice, updateNotice, deleteNotice } from "@/lib/notices";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ResourceCardSkeleton } from "@/components/ui/Skeleton";
import type { Notice } from "@/lib/types";

export default function NoticesPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "Notice Board", href: "/notices" }]);
  }, [setBreadcrumbs]);

  const classroomUnitId = user?.classroomUnitId ?? "";
  const isCR = user?.role === "CR";

  const { data: noticesData, isLoading } = useQuery({
    queryKey: ["notices", classroomUnitId],
    queryFn: () => getNotices(classroomUnitId),
    enabled: !!classroomUnitId,
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingNoticeId(null);
    setTitle("");
    setContent("");
    setError("");
  };

  const openCreateModal = () => {
    setEditingNoticeId(null);
    setTitle("");
    setContent("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNoticeId(notice.id);
    setTitle(notice.title);
    setContent(notice.content);
    setError("");
    setShowModal(true);
  };

  const { mutate: handleCreate, isPending: creating } = useMutation({
    mutationFn: () => createNotice({ title, content, classroomUnitId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices", classroomUnitId] });
      closeModal();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to publish notice");
    },
  });

  const { mutate: handleEdit, isPending: updating } = useMutation({
    mutationFn: () => updateNotice(editingNoticeId!, { title, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notices", classroomUnitId] });
      closeModal();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to update notice");
    },
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id: string) => deleteNotice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notices", classroomUnitId] }),
  });

  const notices = noticesData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Notice Board
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Official announcements published by your Class Representatives
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge variant="PRIVATE">Classroom Scoped</Badge>
          {isCR && (
            <Button variant="accent" icon={<Plus size={16} />} onClick={openCreateModal}>
              Publish Notice
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...Array(3)].map((_, i) => <ResourceCardSkeleton key={i} />)}
        </div>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
          <Megaphone size={40} style={{ color: "var(--text-subtle)", margin: "0 auto 16px" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            No notices published yet
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Announcements from your Class Representatives will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {notices.map((notice) => (
            <Card key={notice.id} padding="lg">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <Badge variant="Notes">Notice</Badge>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={13} /> {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                  {isCR && (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => openEditModal(notice)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-subtle)", padding: 4 }}
                        title="Edit Notice"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#dc2626", padding: 4 }}
                        title="Delete Notice"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
                {notice.title}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                {notice.content}
              </p>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={13} /> Published by <strong style={{ color: "var(--text)" }}>{notice.author?.name ?? "CR"}</strong>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Publish/Edit Notice Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 520, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800 }}>
                  {editingNoticeId ? "Edit Notice" : "Publish Notice"}
                </h3>
                <button onClick={closeModal} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Notice Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mid-Term Examination Schedule" />
                <div>
                  <label className="input-label">Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="input-field"
                    placeholder="Enter detailed notice content..."
                    style={{ resize: "vertical" }}
                  />
                </div>

                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                  <Button
                    variant="accent"
                    loading={editingNoticeId ? updating : creating}
                    disabled={!title.trim() || !content.trim()}
                    onClick={() => (editingNoticeId ? handleEdit() : handleCreate())}
                  >
                    {editingNoticeId ? "Save Changes" : "Publish"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

