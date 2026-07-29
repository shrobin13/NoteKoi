"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useUIStore } from "@/store/ui";

export function Breadcrumb() {
  const { breadcrumbs } = useUIStore();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="breadcrumb"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.8rem",
        color: "var(--text-subtle)",
        fontWeight: 500,
      }}
    >
      <Link
        href="/dashboard"
        style={{
          display: "flex",
          alignItems: "center",
          color: "var(--text-subtle)",
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--default-color)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-subtle)")}
      >
        <Home size={13} />
      </Link>

      <AnimatePresence mode="popLayout">
        {breadcrumbs.map((crumb, i) => (
          <motion.span
            key={crumb.href}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.05 }}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <ChevronRight
              size={12}
              style={{ color: "var(--border-strong)", flexShrink: 0 }}
            />
            {i === breadcrumbs.length - 1 ? (
              <span
                style={{
                  color: "var(--default-color)",
                  fontWeight: 600,
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                style={{
                  color: "var(--text-muted)",
                  transition: "color 0.15s",
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--default-color)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")
                }
              >
                {crumb.label}
              </Link>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
    </nav>
  );
}
