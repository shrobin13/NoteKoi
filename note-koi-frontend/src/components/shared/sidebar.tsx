"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/store/use-user-store";

interface SidebarItem {
  href: string;
  label: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

interface SidebarProps {
  role: UserRole;
}

const sidebarGroups: Record<UserRole, SidebarGroup[]> = {
  GUEST: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    }
  ],
  STUDENT: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    },
    {
      title: "Actions",
      items: [
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" }
      ]
    }
  ],
  TEACHER: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    },
    {
      title: "Actions",
      items: [
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" }
      ]
    }
  ],
  CR: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    },
    {
      title: "Actions",
      items: [
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" }
      ]
    },
    {
      title: "Moderation",
      items: [
        { href: "/moderate/cr", label: "Review Queue" },
        { href: "/moderate/cr/student-verifications", label: "Verify Students" }
      ]
    }
  ],
  CO_CR: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    },
    {
      title: "Actions",
      items: [
        { href: "/upload", label: "Upload" },
        { href: "/my-uploads", label: "My Uploads" }
      ]
    },
    {
      title: "Moderation",
      items: [
        { href: "/moderate/cr", label: "Review Queue" },
        { href: "/moderate/cr/student-verifications", label: "Verify Students" }
      ]
    }
  ],
  SUB_ADMIN: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    },
    {
      title: "Manage",
      items: [
        { href: "/manage/sub-admin/queue", label: "Moderation Queue" },
        { href: "/manage/sub-admin/teacher-verifications", label: "Verify Teachers" },
        { href: "/manage/sub-admin/cr-assignments", label: "CR Assignments" },
        { href: "/manage/sub-admin/analytics", label: "Analytics" }
      ]
    }
  ],
  PLATFORM_ADMIN: [
    {
      title: "Browse",
      items: [
        { href: "/", label: "Discover" },
        { href: "/search", label: "Search" },
        { href: "/notifications", label: "Notifications" },
        { href: "/profile", label: "Profile" }
      ]
    },
    {
      title: "Admin",
      items: [
        { href: "/admin/structure", label: "Colleges & Departments" },
        { href: "/admin/sub-admins", label: "Sub Admins" },
        { href: "/admin/analytics", label: "Analytics & Logs" },
        { href: "/admin/override", label: "Resource Override" },
        { href: "/admin/promotion-override", label: "Promotion Override" },
        { href: "/admin/emergency-appointment", label: "Emergency Appointment" }
      ]
    }
  ]
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const groups = sidebarGroups[role] || sidebarGroups.GUEST;

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-6">
      <div className="mb-6">
        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace</p>
          <h2 className="mt-2 text-lg font-semibold">NoteKoi</h2>
        </div>
      </div>
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.title} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{group.title}</p>
            <nav className="space-y-2">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-3xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-slate-800 text-white"
                        : "text-slate-100 hover:bg-slate-800/90"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
