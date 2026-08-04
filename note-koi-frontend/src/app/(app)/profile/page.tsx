"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useLogoutMutation } from "@/hooks/useLogoutMutation";
import { useTheme } from "@/providers/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { getColleges } from "@/lib/api/colleges";
import { getDepartments } from "@/lib/api/departments";

const ROLE_TONE: Record<string, string> = {
  STUDENT: "blue",
  TEACHER: "approved",
  SUB_ADMIN: "pending",
  PLATFORM_ADMIN: "role",
};

export default function ProfilePage() {
  const { user, isLoading, error } = useRequireAuth();
  const logoutMutation = useLogoutMutation();

  const { data: colleges } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 10,
  });
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: 1000 * 60 * 10,
  });

  const collegeName = colleges?.find((c) => c.id === user?.collegeId)?.name;
  const departmentName = departments?.find((d) => d.id === user?.departmentId)?.name;
  const { theme } = useTheme();

  const header = (
    <div>
      <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Profile</p>
      <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Your account</h1>
    </div>
  );

  if (isLoading) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        {header}
        <div className="h-60 animate-pulse rounded-[16px] border border-[var(--line-soft)] bg-[var(--ph)]" />
      </section>
    );
  }

  if (error || !user) {
    return (
      <section className="mx-auto max-w-3xl space-y-6">
        {header}
        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6">
          <p className="text-[12.5px] text-[var(--ink-soft)]">Please refresh or try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {header}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Main card */}
        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-[16px] font-semibold text-[var(--ink)]">{user.name ?? user.email}</p>
              <p className="text-[12px] text-[var(--ink-soft)]">{user.email}</p>
            </div>
            <Badge tone={user.isVerified ? "approved" : "pending"}>
              {user.isVerified ? "Verified" : "Pending"}
            </Badge>
          </div>

          <div className="rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] divide-y divide-[var(--line-soft)]">
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Role</span>
              <Badge tone={ROLE_TONE[user.role] ?? "slate"}>{user.role.replace(/_/g, " ")}</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">College</span>
              <span className="font-semibold text-[var(--ink)]">{collegeName ?? user.collegeId ?? "Not set"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[12px]">
              <span className="text-[var(--ink-soft)]">Department</span>
              <span className="font-semibold text-[var(--ink)]">{departmentName ?? user.departmentId ?? "Not set"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/profile/edit">
              <Button variant="secondary">Edit Profile</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
            </Button>
          </div>

          {logoutMutation.isError && (
            <p className="text-[12px] text-[#d24545]">Unable to sign out. Please try again.</p>
          )}
        </div>

        {/* Right column: activity + appearance */}
        <div className="space-y-4">
          {/* Activity card */}
          <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-5 space-y-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Activity</p>
            <div className="space-y-2">
              <div className="rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] px-4 py-3 text-[12px]">
                <p className="font-semibold text-[var(--ink)]">My Uploads</p>
                <Link href="/my-uploads" className="mt-0.5 block text-[#3f6fd6] text-[11.5px] hover:underline">
                  View all →
                </Link>
              </div>
              <div className="rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] px-4 py-3 text-[12px]">
                <p className="font-semibold text-[var(--ink)]">Notifications</p>
                <Link href="/notifications" className="mt-0.5 block text-[#3f6fd6] text-[11.5px] hover:underline">
                  View all →
                </Link>
              </div>
            </div>
          </div>

          {/* Appearance card */}
          <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-5 space-y-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Appearance</p>
            <div className="flex items-center justify-between rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] px-4 py-3">
              <div>
                <p className="text-[12px] font-semibold text-[var(--ink)]">Theme</p>
                <p className="text-[11px] text-[var(--ink-soft)]">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
