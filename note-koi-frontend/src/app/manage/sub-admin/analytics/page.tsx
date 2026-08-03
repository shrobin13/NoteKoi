"use client";

import { useQuery } from "@tanstack/react-query";
import { getContentGaps, getDedupSavings, getCRThroughput } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";

/**
 * Sub Admin Analytics — Milestone 6 task 6 / wireframe B.22
 * Data cards: Content Gaps, Dedup Savings, CR Throughput
 * Saved Views → UpcomingFeatureCard per wirefram-resolution.md §1 OQ#10
 */
export default function SubAdminAnalyticsPage() {
  const { data: contentGaps, isLoading: loadingGaps } = useQuery({
    queryKey: ["analytics", "content-gaps"],
    queryFn: getContentGaps,
    staleTime: 1000 * 60 * 10,
  });

  const { data: dedupSavings, isLoading: loadingDedup } = useQuery({
    queryKey: ["analytics", "dedup-savings"],
    queryFn: getDedupSavings,
    staleTime: 1000 * 60 * 10,
  });

  const { data: crThroughput, isLoading: loadingThroughput } = useQuery({
    queryKey: ["analytics", "cr-throughput"],
    queryFn: getCRThroughput,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Manage</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Analytics</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Platform and moderation performance metrics for your college.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Content Gaps */}
        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Content Gaps</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {loadingGaps ? "—" : (contentGaps?.length ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-400">Departments with low resource coverage</p>
          {!loadingGaps && contentGaps && contentGaps.length > 0 && (
            <div className="mt-4 space-y-2">
              {contentGaps.slice(0, 3).map((g) => (
                <div key={g.departmentId} className="flex justify-between text-sm">
                  <span className="text-slate-300">{g.name}</span>
                  <span className="font-medium text-white">{g.resourceCount}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dedup Savings */}
        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Dedup Savings</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {loadingDedup ? "—" : (dedupSavings?.saved ?? 0)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Duplicate files prevented out of {loadingDedup ? "—" : (dedupSavings?.totalChecked ?? 0)} checked
          </p>
        </Card>

        {/* CR Throughput */}
        <Card className="border-slate-700/80 bg-slate-900/80 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">CR Throughput</p>
          <p className="mt-3 text-3xl font-bold text-white">
            {loadingThroughput
              ? "—"
              : crThroughput?.reduce((sum, c) => sum + c.approved + c.rejected, 0) ?? 0}
          </p>
          <p className="mt-1 text-sm text-slate-400">Total moderation actions across all CRs</p>
          {!loadingThroughput && crThroughput && crThroughput.length > 0 && (
            <div className="mt-4 space-y-2">
              {crThroughput.slice(0, 3).map((c) => (
                <div key={c.crId} className="flex justify-between text-sm">
                  <span className="text-slate-300">{c.name ?? c.crId}</span>
                  <span className="font-medium text-green-400">{c.approved}✓</span>
                  <span className="font-medium text-rose-400">{c.rejected}✗</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Saved Views — UpcomingFeatureCard per wirefram-resolution.md §1 OQ#10 */}
      <div className="mt-8">
        <UpcomingFeatureCard
          title="Saved Views aren't available yet"
          description="Saving custom table filters and column preferences requires a backend persistence endpoint that doesn't exist yet."
        />
      </div>
    </section>
  );
}
