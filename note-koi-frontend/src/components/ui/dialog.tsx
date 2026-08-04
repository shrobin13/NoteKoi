"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ open, title, description, onClose, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-xl rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6 shadow-2xl"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-semibold text-[var(--ink)]">{title}</h2>
                {description ? (
                  <p className="mt-1.5 text-[12.5px] text-[var(--ink-soft)]">{description}</p>
                ) : null}
              </div>
              <Button variant="ghost" onClick={onClose} className="rounded-[8px] px-3 py-1.5 text-[var(--ink-soft)]">
                Close
              </Button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
