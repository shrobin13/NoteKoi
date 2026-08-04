"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/shared/resource-card";
import { useResourcesQuery } from "@/hooks/useResourcesQuery";
import { useDepartmentsQuery } from "@/hooks/useDepartmentsQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";

const ROLE_TONE: Record<string, string> = {
  GUEST: "slate",
  STUDENT: "blue",
  TEACHER: "approved",
  CR: "platform",
  CO_CR: "platform",
  SUB_ADMIN: "pending",
  PLATFORM_ADMIN: "role",
};

export default function DashboardPage() {
  const { data: user } = useUsersQuery();
  const { data: resourcesData, isLoading: isLoadingResources } = useResourcesQuery({ limit: 10, page: 1 });
  const { data: departments, isLoading: isLoadingDepts } = useDepartmentsQuery();

  const recentResources = resourcesData?.items?.slice(0, 10) ?? [];
  const browseableDepts = departments?.slice(0, 8) ?? [];

  const isModerator =
    user?.role === "CR" ||
    user?.role === "CO_CR" ||
    user?.role === "SUB_ADMIN" ||
    user?.role === "PLATFORM_ADMIN";

  const queueHref =
    user?.role === "CR" || user?.role === "CO_CR"
      ? "/moderate/cr"
      : user?.role === "SUB_ADMIN"
      ? "/manage/sub-admin/queue"
      : "/admin/structure";

  return (
    <section className="mx-auto max-w-5xl space-y-10">
      {/* Hero */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-semibold text-[var(--ink)]">Discover</h1>
            {user && (
              <Badge tone={ROLE_TONE[user.role] ?? "slate"}>
                {user.role.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-[13px] text-[var(--ink-soft)]">
            {user
              ? `Welcome back, ${user.name ?? user.email}.`
              : "Browse academic resources shared across colleges."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            isModerator ? (
              <Link href={queueHref}>
                <Button variant="secondary">Go to Queue</Button>
              </Link>
            ) : (
              <Link href="/upload">
                <Button>+ Upload Resource</Button>
              </Link>
            )
          ) : (
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Resources */}
      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">Recent Resources</h2>

        {isLoadingResources ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]"
              />
            ))}
          </div>
        ) : recentResources.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-8 text-center">
            <p className="text-[12.5px] text-[var(--ink-soft)]">No resources yet. Be the first to upload.</p>
            {user && (
              <div className="mt-4">
                <Link href="/upload">
                  <Button>Upload the first resource</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Browse by Department */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[var(--ink)]">Browse by Department</h2>
          {(departments?.length ?? 0) > 8 && (
            <Link href="/departments" className="text-[12px] text-[#3f6fd6] hover:underline">
              View all
            </Link>
          )}
        </div>

        {isLoadingDepts ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]"
              />
            ))}
          </div>
        ) : browseableDepts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {browseableDepts.map((dept) => (
              <Link key={dept.id} href={`/browse/${dept.id}`}>
                <div className="cursor-pointer rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 transition hover:border-[var(--ink-soft)] hover:shadow-sm">
                  <p className="text-[13px] font-semibold text-[var(--ink)]">{dept.name}</p>
                  <p className="mt-1 text-[11px] text-[var(--ink-soft)]">Browse sessions →</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-6 text-center">
            <p className="text-[12.5px] text-[var(--ink-soft)]">No departments available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
