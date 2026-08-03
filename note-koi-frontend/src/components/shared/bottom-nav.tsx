import Link from "next/link";
import { cn } from "@/lib/utils";

import { UserRole } from "@/store/use-user-store";

interface BottomNavProps {
  role?: UserRole;
}

export function BottomNav({ role = "GUEST" }: BottomNavProps) {
  const common = [
    { href: "/", label: "Discover" },
    { href: "/search", label: "Search" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" }
  ];

  const actions = role === "STUDENT" || role === "TEACHER" || role === "CR" || role === "CO_CR" || role === "SUB_ADMIN" || role === "PLATFORM_ADMIN"
    ? [{ href: "/upload", label: "Upload" }]
    : [];

  const items = [...common, ...actions];

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 rounded-3xl px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
