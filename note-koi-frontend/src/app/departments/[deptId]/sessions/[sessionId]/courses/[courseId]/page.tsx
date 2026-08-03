"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getResources } from "@/lib/api/resources";
import { ResourceCard } from "@/components/shared/resource-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";

interface CourseBrowsePageProps {
  params: {
    deptId: string;
    sessionId: string;
    courseId: string;
  };
}

/**
 * Hierarchical Browse Screen — Milestone 3 task 2 / wireframe B.9
 * Route: /departments/[deptId]/sessions/[sessionId]/courses/[courseId]
 * Render breadcrumbs (Department → Session → Course).
 * List resources using ResourceCard grid.
 * "Include other colleges" toggle switch (modifies ?includeOtherColleges=true query param).
 */
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs — Milestone 3 task 2 */}
      <nav className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link href="/" className="hover:text-slate-200">Home</Link>
        <span>/</span>
        <span className="text-slate-300">Dept {deptId}</span>
        <span>/</span>
        <span className="text-slate-300">Session {sessionId}</span>
        <span>/</span>
        <span className="text-white font-semibold">{courseId}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Hierarchical Browse</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Course Resources</h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse published notes, PYQs, and lecture slides for this course.
          </p>
        </div>

        {/* "Include other colleges" toggle switch — Milestone 3 task 2 */}
        <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 cursor-pointer shadow-md">
          <span className="text-sm font-medium text-slate-200">Include other colleges</span>
          <input
            type="checkbox"
            checked={includeOtherColleges}
            onChange={(e) => setIncludeOtherColleges(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/80" />
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
        <div className="grid gap-6 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      )}
    </section>
  );
}
