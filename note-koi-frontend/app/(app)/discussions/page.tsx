"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, BookOpen, Send, Lock } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const MOCK_GROUPS = [
  { id: "1", name: "Data Structures & Algorithms Chat", members: 42, course: "CSE-201", unread: 3 },
  { id: "2", name: "General Class Discussion — Session 2024-2025", members: 68, course: "General", unread: 0 },
];

export default function DiscussionsPage() {
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Discussions", href: "/discussions" }]);
  }, [setBreadcrumbs]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Classroom Discussions
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Academic discussion channels managed by your Class Representatives
          </p>
        </div>
        <Badge variant="PRIVATE">Verified Students Only</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, minHeight: 500 }}>
        {/* Sidebar list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-subtle)" }}>
            Channels
          </h3>
          {MOCK_GROUPS.map((g, i) => (
            <Card key={g.id} padding="md" hover style={{ background: i === 0 ? "var(--surface-glass-dark)" : undefined, borderColor: i === 0 ? "var(--border-strong)" : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>{g.name}</h4>
                {g.unread > 0 && <span style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--radius-full)", padding: "2px 8px", fontSize: "0.68rem", fontWeight: 800 }}>{g.unread}</span>}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 4 }}>
                <Users size={12} /> {g.members} members · {g.course}
              </p>
            </Card>
          ))}
        </div>

        {/* Chat box mock */}
        <Card padding="none" style={{ display: "flex", flexDirection: "column", justifyContent: "between", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-elevated)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>Data Structures & Algorithms Chat</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>Course-linked discussion channel · 42 members</p>
          </div>

          <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
            <div style={{ background: "var(--surface-glass-dark)", padding: "12px 16px", borderRadius: "var(--radius-md)", maxWidth: "80%" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--default-color)", marginBottom: 2 }}>Alex Vance (CR)</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text)" }}>Has everyone checked the updated recursion notes uploaded to the course drive?</p>
            </div>
            <div style={{ background: "rgba(143,191,159,0.15)", padding: "12px 16px", borderRadius: "var(--radius-md)", maxWidth: "80%", alignSelf: "flex-end" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--default-color)", marginBottom: 2 }}>You</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text)" }}>Yes! The tree traversal diagrams were very clear, thanks!</p>
            </div>
          </div>

          <div style={{ padding: 16, borderTop: "1px solid var(--border)", display: "flex", gap: 10, background: "var(--surface-elevated)" }}>
            <input placeholder="Type a message to your classmates..." className="input-field" style={{ flex: 1 }} />
            <Button variant="primary" icon={<Send size={14} />}>Send</Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
