"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Pin, Clock, User, MessageSquare } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const MOCK_NOTICES = [
  {
    id: "1",
    title: "Mid-Term Examination Schedule & Syllabus Revision",
    content: "The mid-term exam schedule for Semester 4 Computer Science has been published. Please check the course drives for updated syllabus topics.",
    author: "CR — Alex Vance",
    date: "July 28, 2026",
    pinned: true,
    category: "Academic",
  },
  {
    id: "2",
    title: "Algorithms Project Phase 1 Submission Deadline Extended",
    content: "Due to server maintenance, the submission link for Phase 1 of the DSA project will remain active until Friday 11:59 PM.",
    author: "Co-CR — Sarah Chen",
    date: "July 26, 2026",
    pinned: false,
    category: "Deadline",
  },
];

export default function NoticesPage() {
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ label: "Notice Board", href: "/notices" }]);
  }, [setBreadcrumbs]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Notice Board
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Official announcements published by your Class Representatives
          </p>
        </div>
        <Badge variant="PRIVATE">Classroom Scoped</Badge>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MOCK_NOTICES.map((notice) => (
          <Card key={notice.id} padding="lg">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {notice.pinned && <Pin size={16} style={{ color: "var(--accent)", transform: "rotate(45deg)" }} />}
                <Badge variant={notice.pinned ? "PYQ" : "Notes"}>{notice.category}</Badge>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={13} /> {notice.date}
              </span>
            </div>

            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
              {notice.title}
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              {notice.content}
            </p>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: 6 }}>
                <User size={13} /> Published by <strong style={{ color: "var(--text)" }}>{notice.author}</strong>
              </span>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
