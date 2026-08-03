"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";

interface TopBarProps {
  onOpenMobileNav: () => void;
}

const routeMetadata = [
  { match: /^\/$/, title: "Discover", subtitle: "Browse shared resources, featured cards, and community highlights." },
  { match: /^\/search$/, title: "Search", subtitle: "Find notes, slides, and uploads by keyword or topic." },
  { match: /^\/notifications$/, title: "Notifications", subtitle: "Review alerts, approvals, and recent activity." },
  { match: /^\/profile$/, title: "Profile", subtitle: "Manage your account, role, and recent activity." },
  { match: /^\/upload$/, title: "Upload", subtitle: "Share a new resource with the NoteKoi community." },
  { match: /^\/my-uploads$/, title: "My Uploads", subtitle: "Track your submitted resources and edit details." },
  { match: /^\/verification-pending$/, title: "Verification Pending", subtitle: "Check your account approval status and next steps." },
  { match: /^\/profile\/edit$/, title: "Edit Profile", subtitle: "Update your account details and profile information." }
] as const;

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const { data: notifications, isLoading: isNotificationsLoading } = useNotificationsQuery(1, 8);

  const activeRoute = useMemo(
    () => routeMetadata.find((route) => route.match.test(pathname || "/")) ?? routeMetadata[0],
    [pathname]
  );

  const unreadCount = useMemo(
    () => notifications?.filter((notification) => !notification.read).length ?? 0,
    [notifications]
  );

  return (
    <div className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/95 px-4 py-4 backdrop-blur-md lg:px-8">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{activeRoute.title}</p>
          <p className="mt-1 text-sm text-slate-400">{activeRoute.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="rounded-full px-4 py-2 text-xs uppercase tracking-[0.22em] lg:hidden"
            onClick={onOpenMobileNav}
          >
            Menu
          </Button>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/notifications" className="relative inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-100 transition hover:bg-slate-800/90">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {unreadCount > 0 && !isNotificationsLoading ? (
                <span className="ml-2 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-500 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-950">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
            <div className="relative inline-flex items-center rounded-full bg-slate-900 px-3 py-2 text-sm text-slate-100">
              <span className="text-slate-400">A</span>
              <span className="ml-2">Profile</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            aria-label="Global search"
            placeholder="Search resources, courses, or people..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="violet">Platform</Badge>
          <Badge tone="amber">Pending</Badge>
        </div>
      </div>
    </div>
  );
}
