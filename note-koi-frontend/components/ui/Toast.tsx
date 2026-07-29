"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onDismiss: (id: string) => void;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
  warning: <AlertTriangle size={16} />,
};

const colors: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: "rgba(143,191,159,0.15)", color: "#24613b", border: "rgba(143,191,159,0.4)" },
  error: { bg: "rgba(239,68,68,0.08)", color: "#dc2626", border: "rgba(239,68,68,0.3)" },
  info: { bg: "rgba(89,134,214,0.1)", color: "#2d57b0", border: "rgba(89,134,214,0.3)" },
  warning: { bg: "rgba(241,143,1,0.1)", color: "#c87500", border: "rgba(241,143,1,0.3)" },
};

export function Toast({ id, type, message, onDismiss, duration = 4000 }: ToastProps) {
  const { bg, color, border } = colors[type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "var(--shadow-md)",
        fontSize: "0.88rem",
        fontWeight: 500,
        minWidth: 260,
        maxWidth: 380,
      }}
    >
      {icons[type]}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => onDismiss(id)}
        style={{ opacity: 0.6, lineHeight: 0 }}
        className="hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ── Toast Container ────────────────────────────────────────────────────────
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
