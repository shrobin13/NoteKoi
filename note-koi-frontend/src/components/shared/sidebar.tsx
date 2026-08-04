"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/store/use-user-store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/providers/theme-provider";

interface SidebarItem {
  href: string;
  label: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const sidebarGroups: Record<UserRole, SidebarGroup[]> = {
  GUEST: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
      ],
    },
  ],
  STUDENT: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" },
      ],
    },
  ],
  TEACHER: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" },
      ],
    },
  ],
  CR: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" },
      ],
    },
    {
      title: "Moderate",
      items: [
        { href: "/moderate/cr", label: "Review Queue" },
        { href: "/moderate/cr/student-verifications", label: "Verify Students" },
      ],
    },
  ],
  CO_CR: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" },
      ],
    },
    {
      title: "Moderate",
      items: [
        { href: "/moderate/cr", label: "Review Queue" },
        { href: "/moderate/cr/student-verifications", label: "Verify Students" },
      ],
    },
  ],
  SUB_ADMIN: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" },
      ],
    },
    {
      title: "Manage",
      items: [
        { href: "/manage/sub-admin/queue", label: "Moderation Queue" },
        { href: "/manage/sub-admin/teacher-verifications", label: "Verify Teachers" },
        { href: "/manage/sub-admin/cr-assignments", label: "CR Assignments" },
        { href: "/manage/sub-admin/analytics", label: "Analytics" },
      ],
    },
  ],
  PLATFORM_ADMIN: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" },
      ],
    },
    {
      title: "Administration",
      items: [
        { href: "/admin/structure", label: "Colleges & Departments" },
        { href: "/admin/sub-admins", label: "Sub Admins" },
        { href: "/admin/analytics", label: "Analytics & Logs" },
        { href: "/admin/override", label: "Resource Override" },
        { href: "/admin/promotion-override", label: "Promotion Override" },
        { href: "/admin/emergency-appointment", label: "Emergency Appointment" },
      ],
    },
  ],
};

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const groups = sidebarGroups[role] ?? sidebarGroups.GUEST;
  const { theme } = useTheme();

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-[var(--line-soft)] bg-[var(--paper)] px-3.5 py-5">
      {/* Brand */}
      <div className="mb-4 px-2">
        <div className="text-[13px] font-bold tracking-[0.02em] text-[var(--ink)]">NoteKoi</div>
        <div className="mt-0.5 text-[11px] text-[var(--ink-soft)]">Resource sharing platform</div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <div className="mb-1.5 px-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--ink-soft)]">
              {group.title}
            </div>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-[8px] px-2 py-[7px] text-[12.5px] transition-colors",
                      isActive
                        ? "bg-[var(--ink)] text-white"
                        : "text-[var(--ink)] hover:bg-[var(--ph)]"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 flex-none rounded-full",
                        isActive ? "bg-white" : "bg-[var(--line)]"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Theme toggle at the bottom */}
      <div className="mt-6 border-t border-[var(--line-soft)] pt-4 px-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--ink-soft)]">
            {theme === "dark" ? "Dark" : "Light"} mode
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
