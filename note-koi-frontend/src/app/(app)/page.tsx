"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/shared/resource-card";
import { useResourcesQuery } from "@/hooks/useResourcesQuery";
import { useDepartmentsQuery } from "@/hooks/useDepartmentsQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";

const ROLE_PILL: Record<string, string> = {
  GUEST: "bg-slate-700 text-slate-300",
  STUDENT: "bg-indigo-900/60 text-indigo-300",
  TEACHER: "bg-teal-900/60 text-teal-300",
  CR: "bg-violet-900/60 text-violet-300",
  CO_CR: "bg-violet-900/60 text-violet-300",
  SUB_ADMIN: "bg-amber-900/60 text-amber-300",
  PLATFORM_ADMIN: "bg-rose-900/60 text-rose-300",
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
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-white">Discover</h1>
            {user && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${ROLE_PILL[user.role] ?? ROLE_PILL.GUEST}`}
              >
                {user.role.replace("_", " ")}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-slate-300">
            {user
              ? `Welcome back, ${user.name ?? user.email}.`
              : "Browse academic resources shared across colleges."}
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          <Link href="/search">
            <Button variant="ghost">Search</Button>
          </Link>
        </div>
      </div>

      {/* Recent Resources */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Resources</h2>

        {isLoadingResources ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/80"
              />
            ))}
          </div>
        ) : recentResources.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        ) : (
          <Card className="border-slate-700/80 bg-slate-900/80 p-8 text-center">
            <p className="text-slate-300">No resources yet. Be the first to upload.</p>
            {user && (
              <div className="mt-4">
                <Link href="/upload">
                  <Button>Upload the first resource</Button>
                </Link>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Browse by Department */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Browse by Department</h2>
          {(departments?.length ?? 0) > 8 && (
            <Link href="/departments" className="text-sm text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          )}
        </div>

        {isLoadingDepts ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/80"
              />
            ))}
          </div>
        ) : browseableDepts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {browseableDepts.map((dept) => (
              <Link key={dept.id} href={`/browse/${dept.id}`}>
                <Card className="h-full cursor-pointer border-slate-700/80 bg-slate-900/80 p-5 transition hover:border-indigo-500/60 hover:bg-slate-800/80">
                  <p className="font-semibold text-white">{dept.name}</p>
                  <p className="mt-1 text-xs text-slate-400">Browse sessions →</p>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-slate-700/80 bg-slate-900/80 p-6 text-center">
            <p className="text-slate-400">No departments available yet.</p>
          </Card>
        )}
      </div>
    </section>
  );
}
