"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Hash, User, BookOpen, FileText, ArrowRight } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const QUICK_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: <Hash size={14} /> },
  { label: "My Resources", href: "/dashboard", icon: <FileText size={14} /> },
  { label: "Profile", href: "/profile", icon: <User size={14} /> },
  { label: "Explore Public Resources", href: "/explore", icon: <BookOpen size={14} /> },
];

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = QUICK_LINKS.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery("");
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        commandPaletteOpen ? closeCommandPalette() : useUIStore.getState().openCommandPalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, closeCommandPalette]);

  function navigate(href: string) {
    closeCommandPalette();
    router.push(href);
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommandPalette}
            className="command-palette-backdrop"
          />
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.92, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="command-palette"
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Search size={18} style={{ color: "var(--text-subtle)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, resources..."
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.95rem",
                  color: "var(--text)",
                  fontFamily: "var(--font-body)",
                }}
              />
              <kbd
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "var(--text-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "2px 6px",
                  fontFamily: "var(--font-body)",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div style={{ padding: "8px", maxHeight: 340, overflowY: "auto" }}>
              {query === "" && (
                <p
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                    padding: "8px 12px 4px",
                  }}
                >
                  Quick Navigation
                </p>
              )}
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.button
                    key={`${item.href}-${item.label}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(item.href)}
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
                      color: "var(--text)",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-glass-dark)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <span style={{ color: "var(--text-subtle)" }}>{item.icon}</span>
                    {item.label}
                    <ArrowRight size={12} style={{ color: "var(--text-subtle)", marginLeft: "auto" }} />
                  </motion.button>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <p style={{ textAlign: "center", padding: "24px", color: "var(--text-subtle)", fontSize: "0.88rem" }}>
                  No results for "{query}"
                </p>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                padding: "10px 20px",
                display: "flex",
                gap: 16,
                fontSize: "0.72rem",
                color: "var(--text-subtle)",
              }}
            >
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>ESC close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
