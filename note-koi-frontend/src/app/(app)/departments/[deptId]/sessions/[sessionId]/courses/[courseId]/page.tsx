"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/api/resources";
import { ResourceCard } from "@/components/shared/resource-card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";

interface CourseBrowsePageProps {
  params: {
    deptId: string;
    sessionId: string;
    courseId: string;
  };
}

export default function CourseBrowsePage({ params }: CourseBrowsePageProps) {
  const { deptId, sessionId, courseId } = params;
  const [includeOtherColleges, setIncludeOtherColleges] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["resources", "browse", courseId, includeOtherColleges],
    queryFn: () =>
      getResources({
        courseId,
        sessionId,
        includeOtherColleges,
        limit: 20,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const resources = data?.items ?? [];

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-soft)]">
        <Link href="/" className="hover:text-[var(--ink)]">Home</Link>
        <span>/</span>
        <span>Dept {deptId}</span>
        <span>/</span>
        <span>Session {sessionId}</span>
        <span>/</span>
        <span className="font-semibold text-[var(--ink)]">{courseId}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Browse</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Course Resources</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">Browse published notes, PYQs, and lecture slides for this course.</p>
        </div>

        <button
          type="button"
          onClick={() => setIncludeOtherColleges((prev) => !prev)}
          className={`flex items-center gap-2 rounded-[20px] border px-3 py-1.5 text-[11px] font-medium transition ${
            includeOtherColleges
              ? "border-[#3f6fd6] bg-[#e6ecfb] text-[#3f6fd6]"
              : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)]"
          }`}
        >
          <span className={`h-3 w-3 rounded-full border transition ${includeOtherColleges ? "border-[#3f6fd6] bg-[#3f6fd6]" : "border-[var(--line)]"}`} />
          Include other colleges
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : error ? (
        <EmptyStateBlock title="Unable to load resources" description="Please try refreshing the page." />
      ) : resources.length === 0 ? (
        <EmptyStateBlock
          title="No resources found"
          description={
            includeOtherColleges
              ? "No resources uploaded for this course across any college yet."
              : "No resources found in your college for this course. Try toggling 'Include other colleges' above."
          }
          actionText="Upload a resource"
          actionHref="/upload"
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      )}

      <Link href="/">
        <Button variant="ghost">← Back to Discover</Button>
      </Link>
    </section>
  );
}
