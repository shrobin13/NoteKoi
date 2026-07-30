"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Send, Plus, X, Lock } from "lucide-react";
import { getGroups, createGroup, getMessages, sendMessage } from "@/lib/discussions";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function DiscussionsPage() {
  const { user } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const queryClient = useQueryClient();

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [msgContent, setMsgContent] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "Discussions", href: "/discussions" }]);
  }, [setBreadcrumbs]);

  const classroomUnitId = user?.classroomUnitId ?? "";
  const isCR = user?.role === "CR";

  const { data: groups = [] } = useQuery({
    queryKey: ["discussion-groups", classroomUnitId],
    queryFn: () => getGroups(classroomUnitId),
    enabled: !!classroomUnitId,
  });

  // Select first group if none selected
  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups, activeGroupId]);

  const { data: messagesData } = useQuery({
    queryKey: ["discussion-messages", activeGroupId],
    queryFn: () => getMessages(activeGroupId!),
    enabled: !!activeGroupId,
  });

  const { mutate: handleSend, isPending: sending } = useMutation({
    mutationFn: () => sendMessage(activeGroupId!, msgContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion-messages", activeGroupId] });
      setMsgContent("");
    },
  });

  const { mutate: handleCreateGroup, isPending: creatingGroup } = useMutation({
    mutationFn: () => createGroup({ name: newGroupName, classroomUnitId }),
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["discussion-groups", classroomUnitId] });
      setActiveGroupId(newGroup.id);
      setShowCreateModal(false);
      setNewGroupName("");
      setError("");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "Failed to create group");
    },
  });

  const messages = messagesData?.data ?? [];
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 4 }}>
            Classroom Discussions
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Academic discussion channels managed by your Class Representatives
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge variant="PRIVATE">Verified Students Only</Badge>
          {isCR && (
            <Button variant="accent" icon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
              New Channel
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, minHeight: 520 }}>
        {/* Sidebar list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)", padding: "0 4px" }}>
            Channels ({groups.length})
          </h3>
          {groups.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-subtle)", padding: 8 }}>No discussion channels yet.</p>
          ) : (
            groups.map((g) => (
              <Card
                key={g.id}
                padding="md"
                hover
                onClick={() => setActiveGroupId(g.id)}
                style={{
                  cursor: "pointer",
                  background: activeGroupId === g.id ? "rgba(143,191,159,0.15)" : undefined,
                  borderColor: activeGroupId === g.id ? "var(--default-color)" : undefined,
                }}
              >
                <h4 style={{ fontSize: "0.88rem", fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: 4 }}>
                  {g.name}
                </h4>
                <p style={{ fontSize: "0.72rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Users size={11} /> {g._count?.memberships ?? 1} members {g.course ? `· ${g.course.name}` : ""}
                </p>
              </Card>
            ))
          )}
        </div>

        {/* Chat Box */}
        <Card padding="none" style={{ display: "flex", flexDirection: "column", height: 540, overflow: "hidden" }}>
          {activeGroup ? (
            <>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-elevated)" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>{activeGroup.name}</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                  {activeGroup.course ? `Course Channel (${activeGroup.course.name})` : "General Channel"}
                </p>
              </div>

              {/* Messages list */}
              <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
                {messages.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--text-subtle)", fontSize: "0.85rem", marginTop: 40 }}>
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          background: isMe ? "rgba(143,191,159,0.2)" : "var(--surface-glass-dark)",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--default-color)", marginBottom: 2 }}>
                          {isMe ? "You" : m.sender?.name ?? "Classmate"}
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5 }}>{m.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (msgContent.trim()) handleSend();
                }}
                style={{ padding: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 10, background: "var(--surface-elevated)" }}
              >
                <input
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <Button type="submit" variant="primary" loading={sending} icon={<Send size={14} />}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-subtle)", fontSize: "0.9rem" }}>
              Select a channel to view discussion
            </div>
          )}
        </Card>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(53,53,53,0.5)", backdropFilter: "blur(6px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ width: "100%", maxWidth: 440, background: "var(--surface-elevated)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-strong)", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800 }}>Create Discussion Channel</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}><X size={18} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Channel Name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="e.g. Algorithms General Chat" />
                {error && <p style={{ fontSize: "0.82rem", color: "#dc2626" }}>{error}</p>}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button variant="accent" loading={creatingGroup} onClick={() => handleCreateGroup()}>Create</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
