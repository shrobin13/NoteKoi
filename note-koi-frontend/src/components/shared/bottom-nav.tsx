"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { UserRole } from "@/store/use-user-store";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function DiscoverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="8" r="7" />
      <path d="M10.5 5.5l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="5" />
      <path d="M10.5 10.5l3.5 3.5" />
    </svg>
  );
}
function UploadsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M3 13h10M8 2v8M5 5l3-3 3 3" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="8" cy="5.5" r="3" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" />
    </svg>
  );
}
function QueueIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="2" y="3" width="12" height="3" rx="1" />
      <rect x="2" y="8" width="8" height="3" rx="1" />
      <path d="M12 10l2 2-2 2" />
    </svg>
  );
}
function AdminIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1L2 5.4l4.2-.8z" />
    </svg>
  );
}
function SignInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
    </svg>
  );
}
function RegisterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7" cy="5.5" r="3" />
      <path d="M1 14c0-3 2.5-5 6-5M12 10v4M10 12h4" />
    </svg>
  );
}

const navByRole: Record<UserRole, NavItem[]> = {
  GUEST: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/search", label: "Search", icon: <SearchIcon /> },
    { href: "/login", label: "Sign In", icon: <SignInIcon /> },
    { href: "/register/student", label: "Register", icon: <RegisterIcon /> },
  ],
  STUDENT: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/search", label: "Search", icon: <SearchIcon /> },
    { href: "/my-uploads", label: "My Uploads", icon: <UploadsIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ],
  TEACHER: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/search", label: "Search", icon: <SearchIcon /> },
    { href: "/my-uploads", label: "My Uploads", icon: <UploadsIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ],
  CR: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/moderate/cr", label: "Queue", icon: <QueueIcon /> },
    { href: "/my-uploads", label: "My Uploads", icon: <UploadsIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ],
  CO_CR: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/moderate/cr", label: "Queue", icon: <QueueIcon /> },
    { href: "/my-uploads", label: "My Uploads", icon: <UploadsIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ],
  SUB_ADMIN: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/manage/sub-admin/queue", label: "Queue", icon: <QueueIcon /> },
    { href: "/my-uploads", label: "My Uploads", icon: <UploadsIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ],
  PLATFORM_ADMIN: [
    { href: "/", label: "Discover", icon: <DiscoverIcon /> },
    { href: "/admin/structure", label: "Admin", icon: <AdminIcon /> },
    { href: "/my-uploads", label: "My Uploads", icon: <UploadsIcon /> },
    { href: "/profile", label: "Profile", icon: <ProfileIcon /> },
  ],
};

export function BottomNav({ role = "GUEST" }: { role?: UserRole }) {
  const pathname = usePathname();
  const items = navByRole[role] ?? navByRole.GUEST;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line-soft)] bg-[var(--paper)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] transition-colors",
                isActive
                  ? "text-[var(--ink)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              <span className={cn("transition-transform", isActive && "scale-110")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
