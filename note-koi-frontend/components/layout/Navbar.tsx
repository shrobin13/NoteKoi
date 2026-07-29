"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Command,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { logout } from "@/lib/auth";
import { Breadcrumb } from "./Breadcrumb";

export function Navbar() {
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore();
  const { openCommandPalette, toggleSidebar } = useUIStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    try { await logout(); } catch {}
    storeLogout();
    router.push("/");
  }

  const roleLabel: Record<string, string> = {
    STUDENT: "Student",
    CR: "Class Rep",
    SUB_ADMIN: "Sub Admin",
    OWNER_ADMIN: "Owner Admin",
  };

  return (
    <header
      className="glass-strong"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="btn btn-ghost btn-sm"
        style={{ borderRadius: "var(--radius-sm)" }}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* Logo */}
      <Link
        href={isAuthenticated ? "/dashboard" : "/"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--default-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 800,
            color: "#fff",
            fontFamily: "var(--font-display)",
          }}
        >
          NK
        </div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--text)",
            letterSpacing: "-0.02em",
          }}
        >
          NoteKoi
        </span>
      </Link>

      {/* Breadcrumb */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Breadcrumb />
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCommandPalette}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 12px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border)",
            background: "var(--surface-elevated)",
            cursor: "pointer",
            color: "var(--text-subtle)",
            fontSize: "0.8rem",
            fontFamily: "var(--font-body)",
          }}
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search</span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontSize: "0.65rem",
              fontWeight: 600,
              color: "var(--text-subtle)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              padding: "1px 5px",
            }}
            className="hidden md:flex"
          >
            <Command size={9} /> K
          </span>
        </motion.button>

        {isAuthenticated ? (
          <>
            {/* Bell */}
            <button className="btn btn-ghost btn-sm" style={{ borderRadius: "var(--radius-sm)" }}>
              <Bell size={16} />
            </button>

            {/* Profile dropdown */}
            <div style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setProfileOpen((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px 6px 6px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border)",
                  background: "var(--surface-elevated)",
                  cursor: "pointer",
                  color: "var(--text)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user?.name?.split(" ")[0]}</span>
                <ChevronDown size={13} style={{ opacity: 0.6 }} />
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    onMouseLeave={() => setProfileOpen(false)}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: 200,
                      background: "var(--surface-elevated)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-strong)",
                      boxShadow: "var(--shadow-lg)",
                      overflow: "hidden",
                      zIndex: 200,
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text)" }}>
                        {user?.name}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>{user?.email}</p>
                      {user?.role && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "var(--default-color)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {roleLabel[user.role]}
                        </span>
                      )}
                    </div>
                    {[
                      { icon: <User size={14} />, label: "Profile", href: "/profile" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 16px",
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          transition: "background 0.15s, color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--surface-glass-dark)";
                          (e.currentTarget as HTMLElement).style.color = "var(--text)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid var(--border)", padding: "4px" }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: "var(--radius-sm)",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#dc2626",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }}
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
}
