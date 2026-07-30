"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bell,
  MessageSquare,
  User,
  Users,
  BarChart3,
  CheckSquare,
  Globe,
  Building2,
} from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Colleges", href: "/college", icon: <Building2 size={16} /> },
  { label: "Explore Library", href: "/explore", icon: <Globe size={16} /> },
  { label: "Notices", href: "/notices", icon: <Bell size={16} /> },
  { label: "Discussions", href: "/discussions", icon: <MessageSquare size={16} /> },
  { label: "Profile", href: "/profile", icon: <User size={16} /> },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Verifications", href: "/admin/cr", icon: <CheckSquare size={16} />, roles: ["CR"] },
  { label: "Sub Admin Panel", href: "/admin/sub", icon: <Building2 size={16} />, roles: ["SUB_ADMIN"] },
  { label: "Owner Dashboard", href: "/admin/owner", icon: <BarChart3 size={16} />, roles: ["OWNER_ADMIN"] },
];

export function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const role = user?.role ?? "STUDENT";

  const visible = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
  const adminVisible = ADMIN_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 240, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ overflow: "hidden", flexShrink: 0 }}
        >
          <div className="sidebar" style={{ width: 240 }}>
            {/* Nav items */}
            <div style={{ padding: "16px 12px" }}>
              <p
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "var(--text-subtle)",
                  padding: "0 8px",
                  marginBottom: 8,
                }}
              >
                Main
              </p>
              {visible.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={clsx("sidebar-link", active && "active")}
                    style={{
                      color: active ? "var(--default-color)" : undefined,
                      background: active ? "var(--surface-glass-dark)" : undefined,
                    }}
                  >
                    <span style={{ color: active ? "var(--default-color)" : "var(--text-subtle)" }}>
                      {item.icon}
                    </span>
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        style={{
                          width: 3,
                          height: 14,
                          borderRadius: 2,
                          background: "var(--default-color)",
                          marginLeft: "auto",
                        }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* Admin section */}
              {adminVisible.length > 0 && (
                <>
                  <div
                    className="divider"
                    style={{ margin: "12px 8px" }}
                  />
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                      color: "var(--text-subtle)",
                      padding: "0 8px",
                      marginBottom: 8,
                    }}
                  >
                    Admin
                  </p>
                  {adminVisible.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx("sidebar-link", active && "active")}
                        style={{
                          color: active ? "var(--default-color)" : undefined,
                        }}
                      >
                        <span style={{ color: active ? "var(--default-color)" : "var(--text-subtle)" }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            {/* User footer */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "12px",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-glass-dark)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden", minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-subtle)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontWeight: 600,
                    }}
                  >
                    {role.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
