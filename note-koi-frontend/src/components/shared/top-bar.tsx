"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";
import { useUserStore } from "@/store/use-user-store";
import { useUsersQuery } from "@/hooks/useUsersQuery";

const routeLabels: { match: RegExp; title: string }[] = [
  { match: /^\/$/, title: "Discover" },
  { match: /^\/search/, title: "Search" },
  { match: /^\/notifications/, title: "Notifications" },
  { match: /^\/profile/, title: "Profile" },
  { match: /^\/upload/, title: "Upload" },
  { match: /^\/my-uploads/, title: "My Uploads" },
  { match: /^\/moderate\/cr\/student/, title: "Student Verifications" },
  { match: /^\/moderate\/cr/, title: "CR Moderation Queue" },
  { match: /^\/manage\/sub-admin\/queue/, title: "Moderation Queue" },
  { match: /^\/manage\/sub-admin\/teacher/, title: "Teacher Verifications" },
  { match: /^\/manage\/sub-admin\/cr/, title: "CR Assignments" },
  { match: /^\/manage\/sub-admin\/analytics/, title: "Analytics" },
  { match: /^\/admin\/structure/, title: "Structural CRUD" },
  { match: /^\/admin\/sub-admins/, title: "Sub Admin Management" },
  { match: /^\/admin\/analytics/, title: "Analytics & Logs" },
  { match: /^\/admin\/override/, title: "Resource Override" },
  { match: /^\/admin\/promotion/, title: "Promotion Override" },
  { match: /^\/admin\/emergency/, title: "Emergency Appointment" },
  { match: /^\/resources/, title: "Resource Detail" },
  { match: /^\/browse/, title: "Browse" },
];

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const role = useUserStore((s) => s.role);
  const { data: user } = useUsersQuery();
  const { data: notifications } = useNotificationsQuery(1, 8);

  const title = useMemo(
    () => routeLabels.find((r) => r.match.test(pathname ?? "/"))?.title ?? "NoteKoi",
    [pathname]
  );

  const unread = useMemo(
    () => notifications?.filter((n) => !n.isRead).length ?? 0,
    [notifications]
  );

  const isAuth = role !== "GUEST";

  // Derive avatar initial from name > email > fallback "?"
  const avatarInitial = useMemo(() => {
    if (!user) return "?";
    const src = user.name?.trim() || user.email?.trim() || "";
    return src.charAt(0).toUpperCase() || "?";
  }, [user]);

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--line-soft)] bg-[var(--paper)] px-5 py-3">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded-[8px] border border-[var(--line)] p-2 text-[var(--ink-soft)] hover:bg-[var(--ph)] lg:hidden"
          aria-label="Open navigation"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 2h12M1 7h12M1 12h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="text-[13px] font-semibold text-[var(--ink)]">{title}</span>
      </div>

      {/* Right: search + quick links + notifications + avatar */}
      <div className="flex items-center gap-2">
        {/* Search pill (hidden on mobile) */}
        <Link
          href="/search"
          className="hidden items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--canvas)] px-3 py-1.5 text-[11.5px] text-[var(--ink-soft)] hover:border-[var(--ink-soft)] sm:flex"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8.5 8.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Search resources…
        </Link>

        {isAuth ? (
          <>
            {/* My Uploads quick link */}
            <Link
              href="/my-uploads"
              className="hidden items-center rounded-[8px] border border-[var(--line)] px-3 py-1.5 text-[11.5px] text-[var(--ink-soft)] hover:bg-[var(--ph)] md:flex"
            >
              My Uploads
            </Link>

            {/* Notifications bell */}
            <Link
              href="/notifications"
              className="relative rounded-[8px] border border-[var(--line)] p-2 text-[var(--ink-soft)] hover:bg-[var(--ph)]"
              aria-label="Notifications"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1a4 4 0 014 4v2l1 2H2l1-2V5a4 4 0 014-4z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path d="M5.5 11a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#d24545] px-1 text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ink)] text-[11px] font-bold text-white hover:opacity-80 transition-opacity"
              aria-label="Profile"
              title={user?.name || user?.email || "Profile"}
            >
              {avatarInitial}
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-[8px] border border-[var(--line)] px-3 py-1.5 text-[12px] text-[var(--ink)] hover:bg-[var(--ph)]"
            >
              Sign in
            </Link>
            <Link
              href="/register/student"
              className="rounded-[8px] bg-[var(--ink)] px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
