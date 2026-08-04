"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import Link from "next/link";

interface CommandPaletteProps {
  items: Array<{ href: string; label: string }>;
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const close = useAppStore((state) => state.closeCommandPalette);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const hidePalette = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", hidePalette);
    return () => window.removeEventListener("keydown", hidePalette);
  }, [close]);

  const paletteItems = useMemo(
    () => [
      ...items,
      { href: "/upload", label: "Upload Resource" },
      { href: "/my-uploads", label: "My Uploads" },
      { href: "/verification-pending", label: "Verification Pending" },
    ],
    [items]
  );

  const filteredItems = useMemo(
    () =>
      paletteItems.filter(
        (item) =>
          item.label.toLowerCase().includes(filter.toLowerCase()) ||
          item.href.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter, paletteItems]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Command Palette</p>
            <h2 className="mt-0.5 text-[16px] font-semibold text-[var(--ink)]">Type a command or destination</h2>
          </div>
          <button
            onClick={close}
            className="rounded-[8px] border border-[var(--line)] bg-[var(--ph)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)] transition hover:bg-[var(--ph-strong)]"
          >
            Esc
          </button>
        </div>

        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search commands…"
          autoFocus
          className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-soft)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />

        <div className="mt-3 space-y-1.5">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="flex flex-col rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] px-3.5 py-3 text-[12px] transition hover:border-[var(--ink-soft)] hover:bg-[var(--ph)]"
            >
              <span className="font-semibold text-[var(--ink)]">{item.label}</span>
              <span className="text-[11px] text-[var(--ink-soft)]">{item.href}</span>
            </Link>
          ))}
          {filteredItems.length === 0 && (
            <div className="rounded-[8px] border border-[var(--line-soft)] px-3.5 py-3 text-[12px] text-[var(--ink-soft)]">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
