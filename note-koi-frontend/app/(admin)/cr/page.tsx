"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Users, Plus, Upload, Trash2, X, FileText, XCircle, Lock, Send } from "lucide-react";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/lib/verification";
import { getCRs } from "@/lib/admin";
import { createResource, getUnitResources, deleteResource } from "@/lib/resources";
import { createShare } from "@/lib/shares";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import type { ResourceCategory, Visibility } from "@/lib/types";

export default function CRDashboardPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("Notes");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [fileId, setFileId] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Personal Share composer
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "CR Dashboard", href: "/admin/cr" }]);
  }, [setBreadcrumbs]);

  const classroomUnitId = user?.classroomUnitId ?? "";

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: () => getPendingVerifications(1, 50),
  });

  const { data: crs } = useQuery({
    queryKey: ["crs", classroomUnitId],
    queryFn: () => getCRs(classroomUnitId),
    enabled: !!classroomUnitId,
  });

  const { data: unitResourcesData } = useQuery({
    queryKey: ["unit-resources", classroomUnitId],
    queryFn: () => getUnitResources(classroomUnitId),
    enabled: !!classroomUnitId,
  });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (requestId: string) => approveVerification(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-verifications"] }),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: (requestId: string) => rejectVerification(requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pending-verifications"] }),
  });

  const { mutate: handleUpload, isPending: uploading } = useMutation({
    mutationFn: () =>
      createResource({
        title,
        category,
        visibility,
        fileId: fileId || `drive-file-${Date.now()}`,
        fileUrl: fileUrl || "https://drive.google.com",
        previewUrl: previewUrl || undefined,
        classroomUnitId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-resources", classroomUnitId] });
      setShowUploadModal(false);
      setTitle("");
      setFileId("");
      setFileUrl("");
      setPreviewUrl("");
      setUploadError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setUploadError(e?.response?.data?.message ?? "Failed to upload resource");
    },
  });

  const { mutate: handleDeleteResource } = useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["unit-resources", classroomUnitId] }),
  });

  const { mutate: handleSendShare, isPending: sendingShare } = useMutation({
    mutationFn: () => createShare({ content: shareContent, classroomUnitId, recipientIds: [recipientId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-shares"] });
      setShowShareModal(false);
      setShareContent("");
      setRecipientId("");
      setShareError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setShareError(e?.response?.data?.message ?? "Failed to send personal share");
    },
  });

  const pending = pendingData?.data ?? [];
  const total = pendingData?.meta?.total ?? 0;
  const unitResources = unitResourcesData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            CR Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Manage verifications and academic resources for your classroom unit
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="accent" icon={<Upload size={16} />} onClick={() => setShowUploadModal(true)}>
            Upload Resource
          </Button>
          <Button variant="secondary" icon={<Lock size={16} />} onClick={() => setShowShareModal(true)}>
            Send Confidential Share
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 40 }}>
        {isLoading ? (
          <>
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </>
        ) : (
          [
            { icon: <Clock size={20} />, label: "Pending Verifications", value: total, color: "var(--accent)" },
            { icon: <FileText size={20} />, label: "Unit Resources", value: unitResources.length, color: "var(--default-color)" },
            { icon: <Users size={20} />, label: "CRs in Unit", value: crs?.length ?? "—", color: "var(--secondary)" },
          ].map((stat) => (
            <Card key={stat.label} padding="lg">
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-display)", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Verification Queue */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
          Verification Queue
        </h2>

        {pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
            <CheckCircle size={36} style={{ color: "var(--default-color)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No pending verification requests right now.
            </p>
          </div>
        ) : (
          <div style={{ background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {pending.map((req, i) => (
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: i < pending.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {req.user?.name?.charAt(0) ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>{req.user?.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{req.user?.email}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="primary" size="sm" onClick={() => approve(req.id)} loading={approving} icon={<CheckCircle size={14} />}>
                    Approve
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => reject(req.id)} loading={rejecting} style={{ color: "#dc2626" }}>
                    <XCircle size={14} /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resource Manager */}
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
          Classroom Unit Resources
        </h2>

        {unitResources.length === 0 ? (
          <Card padding="lg" style={{ textAlign: "center" }}>
            <FileText size={32} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No resources uploaded yet. Click "Upload Resource" above to add course materials.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {unitResources.map((res) => (
              <Card key={res.id} padding="md">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                      <Badge variant={res.category}>{res.category}</Badge>
                      <Badge variant={res.visibility}>{res.visibility}</Badge>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{res.title}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(res.id)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "#dc2626", padding: 6 }}
                    title="Delete Resource"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Personal / Confidential Share Composer (CR only) */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Confidential Shares
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)", marginTop: 2 }}>
              Send private, targeted messages to specific students in your unit
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={<Send size={14} />} onClick={() => setShowShareModal(true)}>
            New Share
          </Button>
        </div>
        <div style={{ padding: "20px 24px", background: "rgba(143,191,159,0.06)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: 14 }}>
          <Lock size={20} style={{ color: "var(--default-color)", flexShrink: 0 }} />
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            Personal shares are end-to-end confidential. Only the addressed recipient can read the content. Admins and other students cannot see it.
          </p>
        </div>
      </div>

      {/* Upload Resource Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 500, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800 }}>Upload Academic Resource</h3>
                <button onClick={() => setShowUploadModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Resource Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Database Quiz 1 Solution" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label className="input-label">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value as ResourceCategory)} className="input-field">
                      {["Lecture", "Notes", "PYQ", "Tutorial", "Software", "Other"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Visibility</label>
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)} className="input-field">
                      <option value="PRIVATE">Private (Classroom)</option>
                      <option value="PUBLIC">Public</option>
                    </select>
                  </div>
                </div>

                <Input label="Google Drive File URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../view" />
                <Input label="Preview URL (Optional)" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../preview" />

                {uploadError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{uploadError}</p>}

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                  <Button variant="accent" loading={uploading} onClick={() => handleUpload()}>Upload</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Personal Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 480, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Send Confidential Share</h3>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 4 }}>Only the specified recipient will see this message</p>
                </div>
                <button onClick={() => setShowShareModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Recipient User ID (CUID)" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} placeholder="User ID of recipient student" />
                <div>
                  <label className="input-label">Confidential Content</label>
                  <textarea
                    value={shareContent}
                    onChange={(e) => setShareContent(e.target.value)}
                    rows={4}
                    className="input-field"
                    placeholder="Type your private note or suggestion..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                {shareError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{shareError}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <Button variant="ghost" onClick={() => setShowShareModal(false)}>Cancel</Button>
                  <Button variant="accent" loading={sendingShare} disabled={!recipientId.trim() || !shareContent.trim()} onClick={() => handleSendShare()}>Send Share</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
