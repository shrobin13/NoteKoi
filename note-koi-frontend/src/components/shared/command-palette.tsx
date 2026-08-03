"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  items: Array<{ href: string; label: string }>;
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const close = useAppStore((state) => state.closeCommandPalette);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const hidePalette = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", hidePalette);

    return () => window.removeEventListener("keydown", hidePalette);
  }, [close]);

  const paletteItems = useMemo(
    () => [
      ...items,
      { href: "/upload", label: "Upload Resource" },
      { href: "/my-uploads", label: "My Uploads" },
      { href: "/verification-pending", label: "Verification Pending" }
    ],
    [items]
  );

  const filteredItems = useMemo(
    () =>
      paletteItems.filter((item) =>
        item.label.toLowerCase().includes(filter.toLowerCase()) || item.href.toLowerCase().includes(filter.toLowerCase())
      ),
    [filter, paletteItems]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="w-full max-w-2xl rounded-[24px] border border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Command Palette</p>
            <h2 className="text-2xl font-semibold text-white">Type a command or destination</h2>
          </div>
          <button onClick={close} className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700">
            Esc
          </button>
        </div>
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Search commands..."
          className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="mt-5 grid gap-3">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-sm text-slate-200 transition hover:border-indigo-500/80 hover:bg-slate-800"
              )}
            >
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs text-slate-500">{item.href}</p>
            </Link>
          ))}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-4 text-sm text-slate-400">
              No matching commands found.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
