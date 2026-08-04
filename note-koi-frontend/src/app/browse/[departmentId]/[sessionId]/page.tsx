"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/shared/resource-card";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";
import { useCoursesQuery } from "@/hooks/useCoursesQuery";
import { useResourcesQuery } from "@/hooks/useResourcesQuery";

interface Props {
  params: Promise<{ departmentId: string; sessionId: string }>;
}

export default function BrowseSessionPage({ params }: Props) {
  const { departmentId, sessionId } = use(params);
  const { data: courses } = useCoursesQuery(departmentId);
  const { data: resourcesData, isLoading } = useResourcesQuery({
    sessionId,
    limit: 50,
    page: 1,
  });

  const resources = resourcesData?.items ?? [];
  const courseMap = new Map((courses ?? []).map((c) => [c.id, c.name]));

  const byCourse = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    const key = r.courseId;
    acc[key] = acc[key] ? [...acc[key], r] : [r];
    return acc;
  }, {});

  const courseEntries = Object.entries(byCourse);

  return (
    <section className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Browse</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Session Resources</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">Resources grouped by course for this session.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : courseEntries.length > 0 ? (
        <div className="space-y-8">
          {courseEntries.map(([courseId, items]) => (
            <div key={courseId} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[var(--line-soft)] pb-2">
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                  {courseMap.get(courseId) ?? courseId}
                </h2>
                <span className="rounded-full bg-[var(--ph)] px-2 py-0.5 text-[10px] font-bold text-[var(--ink-soft)]">
                  {items.length}
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {items.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyStateBlock
          title="No resources in this session"
          description="No approved resources have been shared for this session yet."
          actionText="Upload a resource"
          actionHref="/upload"
        />
      )}

      <div className="flex gap-3">
        <Link href={`/browse/${departmentId}`}>
          <Button variant="ghost">← Back to Sessions</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">Discover</Button>
        </Link>
      </div>
    </section>
  );
}
