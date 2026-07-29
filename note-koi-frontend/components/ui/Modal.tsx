"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(53,53,53,0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className={`w-full ${sizeMap[size]} relative`}
              style={{
                background: "var(--surface-elevated)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-strong)",
                boxShadow: "var(--shadow-lg), var(--shadow-glow)",
                overflow: "hidden",
              }}
            >
              {title && (
                <div
                  className="flex items-center justify-between p-6 pb-4"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: "var(--text)",
                    }}
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm"
                    style={{ borderRadius: "var(--radius-sm)" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
