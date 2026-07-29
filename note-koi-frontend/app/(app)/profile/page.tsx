"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Mail, Shield, CheckCircle, Clock, Edit2, Save, X } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { getMe, updateMe } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { setBreadcrumbs } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs([{ label: "Profile", href: "/profile" }]);
  }, [setBreadcrumbs]);

  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: () => updateMe({ name }),
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setEditing(false);
    },
  });

  const displayUser = profile ?? user;
  const roleLabels: Record<string, string> = {
    STUDENT: "Student",
    CR: "Class Representative",
    SUB_ADMIN: "Sub Admin",
    OWNER_ADMIN: "Owner Admin",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      style={{ maxWidth: 680, margin: "0 auto" }}
    >
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800,
        letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8,
      }}>
        My Profile
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
        Manage your account and view your academic details
      </p>

      {/* Avatar + Name card */}
      <div style={{
        background: "var(--surface-elevated)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-strong)",
        boxShadow: "var(--shadow-md), var(--shadow-glow)",
        padding: 32,
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Gradient bar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%)",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, var(--accent) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem", fontWeight: 800, color: "#fff",
            fontFamily: "var(--font-display)",
            boxShadow: "0 8px 24px rgba(143,191,159,0.3)",
            flexShrink: 0,
          }}>
            {displayUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
            ) : (
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800,
                color: "var(--text)", letterSpacing: "-0.02em",
              }}>
                {displayUser?.name}
              </h2>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {displayUser?.role && <Badge variant={displayUser.role}>{roleLabels[displayUser.role]}</Badge>}
              {displayUser?.status && <Badge variant={displayUser.status}>{displayUser.status}</Badge>}
            </div>
          </div>
          <div>
            {editing ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="primary" size="sm" onClick={() => save()} loading={saving} id="profile-save">
                  <Save size={14} /> Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setName(displayUser?.name ?? ""); }} id="profile-cancel">
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)} id="profile-edit">
                <Edit2 size={14} /> Edit
              </Button>
            )}
          </div>
        </div>

        {/* Email row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          background: "var(--surface-glass-dark)", borderRadius: "var(--radius-md)",
        }}>
          <Mail size={16} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
          <span style={{ fontSize: "0.9rem", color: "var(--text)", fontWeight: 500 }}>
            {displayUser?.email}
          </span>
        </div>
      </div>

      {/* Details */}
      <Card padding="lg">
        <h3 style={{
          fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.06em", color: "var(--text-subtle)", marginBottom: 20,
        }}>
          Account Details
        </h3>
        {[
          {
            icon: <Shield size={16} />,
            label: "Role",
            value: displayUser?.role ? roleLabels[displayUser.role] : "—",
          },
          {
            icon: displayUser?.status === "VERIFIED"
              ? <CheckCircle size={16} style={{ color: "var(--default-color)" }} />
              : <Clock size={16} style={{ color: "var(--accent)" }} />,
            label: "Verification Status",
            value: displayUser?.status ?? "—",
          },
          {
            icon: <User size={16} />,
            label: "User ID",
            value: displayUser?.id ? `${displayUser.id.slice(0, 8)}...` : "—",
          },
          ...(displayUser?.createdAt
            ? [{
                icon: <Clock size={16} />,
                label: "Member Since",
                value: new Date(displayUser.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                }),
              }]
            : []),
        ].map(({ icon, label, value }, i, arr) => (
          <div
            key={label}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 0",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span style={{ color: "var(--text-subtle)", lineHeight: 0, flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1, fontWeight: 500 }}>
              {label}
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 600 }}>
              {value}
            </span>
          </div>
        ))}
      </Card>

      {displayUser?.status === "UNVERIFIED" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: "var(--radius-lg)",
            background: "rgba(241,143,1,0.06)",
            border: "1px solid rgba(241,143,1,0.25)",
          }}
        >
          <p style={{ fontSize: "0.88rem", color: "#c87500", fontWeight: 600, marginBottom: 4 }}>
            ⏳ Account Pending Verification
          </p>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            A Class Representative or Admin will review your account shortly. You'll gain full access once verified.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
