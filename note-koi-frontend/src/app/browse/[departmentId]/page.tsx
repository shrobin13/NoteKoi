"use client";

import Link from "next/link";
import { use } from "react";
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
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Browse</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">
          {dept?.name ?? "Department"} — Sessions
        </h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">Choose an academic session to explore resources.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : (sessions?.length ?? 0) > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sessions!.map((session) => (
            <Link key={session.id} href={`/browse/${departmentId}/${session.id}`}>
              <div className="cursor-pointer rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 transition hover:border-[var(--ink-soft)] hover:shadow-sm">
                <p className="text-[13px] font-semibold text-[var(--ink)]">{session.label}</p>
                <p className="mt-1 text-[11px] text-[var(--ink-soft)]">
                  {session.isOpen ? "Open" : "Closed"} · Browse resources →
                </p>
              </div>
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

      <Link href="/">
        <Button variant="ghost">← Back to Discover</Button>
      </Link>
    </section>
  );
}
