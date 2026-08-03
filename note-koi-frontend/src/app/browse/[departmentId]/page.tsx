"use client";

import Link from "next/link";
import { use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { useSessionsQuery } from "@/hooks/useSessionsQuery";
import { useDepartmentsQuery } from "@/hooks/useDepartmentsQuery";

interface Props {
  params: Promise<{ departmentId: string }>;
}

export default function BrowseDepartmentPage({ params }: Props) {
  const { departmentId } = use(params);
  const { data: sessions, isLoading } = useSessionsQuery(departmentId);
  const { data: departments } = useDepartmentsQuery();
  const dept = departments?.find((d) => d.id === departmentId);

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Browse</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">
          {dept?.name ?? "Department"} — Sessions
        </h1>
        <p className="mt-2 text-slate-300">Choose an academic session to explore resources.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/80"
            />
          ))}
        </div>
      ) : (sessions?.length ?? 0) > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions!.map((session) => (
            <Link key={session.id} href={`/browse/${departmentId}/${session.id}`}>
              <Card className="h-full cursor-pointer border-slate-700/80 bg-slate-900/80 p-5 transition hover:border-indigo-500/60 hover:bg-slate-800/80">
                <p className="font-semibold text-white">{session.label}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {session.isOpen ? "Open" : "Closed"} · Browse resources →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyStateBlock
          title="No sessions found"
          description="This department doesn't have any sessions yet."
          actionText="Back to Discover"
          actionHref="/"
        />
      )}

      <div>
        <Link href="/">
          <Button variant="ghost">← Back to Discover</Button>
        </Link>
      </div>
    </section>
  );
}
