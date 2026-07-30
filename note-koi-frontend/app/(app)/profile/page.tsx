"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { User as UserIcon, ShieldCheck, Clock, FileText, Bell, Lock, Send, Plus, X } from "lucide-react";
import { getMyShares, createShare } from "@/lib/shares";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "User Profile", href: "/profile" }]);
  }, [setBreadcrumbs]);

  const isCR = user?.role === "CR";
  const classroomUnitId = user?.classroomUnitId ?? "";

  const { data: sharesData } = useQuery({
    queryKey: ["personal-shares"],
    queryFn: () => getMyShares(1, 20),
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

  const shares = sharesData?.data ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }} style={{ maxWidth: 840, margin: "0 auto" }}>
      {/* Header Profile Card */}
      <Card padding="lg" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "var(--font-display)",
              boxShadow: "0 8px 24px rgba(143,191,159,0.3)",
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>
                {user?.name}
              </h1>
              <Badge variant={user?.role ?? "STUDENT"}>{user?.role?.replace("_", " ")}</Badge>
              <Badge variant={user?.status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED"}>
                {user?.status}
              </Badge>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-subtle)" }}>{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Activity Summary */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
          Activity Summary
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { icon: <FileText size={18} />, label: "Resources Shared", value: isCR ? "Active" : "Member" },
            { icon: <Bell size={18} />, label: "Notices Scope", value: "Classroom" },
            { icon: <ShieldCheck size={18} />, label: "Verification", value: user?.status === "VERIFIED" ? "Approved" : "Pending" },
          ].map((stat) => (
            <Card key={stat.label} padding="md">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(143,191,159,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--default-color)" }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text)" }}>{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Personal / Confidential Shares */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
              Personal / Confidential Shares
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-subtle)" }}>
              Direct private communications addressed specifically to you
            </p>
          </div>
          {isCR && (
            <Button variant="accent" size="sm" icon={<Plus size={14} />} onClick={() => setShowShareModal(true)}>
              Send Share
            </Button>
          )}
        </div>

        {shares.length === 0 ? (
          <Card padding="lg" style={{ textAlign: "center" }}>
            <Lock size={32} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No confidential shares received yet.
            </p>
          </Card>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shares.map((share) => (
              <Card key={share.id} padding="md">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--default-color)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Lock size={12} /> Confidential Share from {share.author?.name ?? "CR"}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-subtle)" }}>
                    {new Date(share.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.5 }}>
                  {share.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Send Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 460, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Send Personal Share</h3>
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
                    placeholder="Type confidential note or suggestion..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                {shareError && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{shareError}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => setShowShareModal(false)}>Cancel</Button>
                  <Button variant="accent" loading={sendingShare} onClick={() => handleSendShare()}>Send Share</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
