"use client";

import { use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
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
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Browse</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Session Resources</h1>
        <p className="mt-2 text-slate-300">Resources grouped by course for this session.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/80"
            />
          ))}
        </div>
      ) : courseEntries.length > 0 ? (
        <div className="space-y-10">
          {courseEntries.map(([courseId, items]) => (
            <div key={courseId} className="space-y-4">
              <h2 className="border-b border-slate-800 pb-3 text-base font-semibold text-white">
                {courseMap.get(courseId) ?? courseId}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({items.length} resource{items.length === 1 ? "" : "s"})
                </span>
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
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
