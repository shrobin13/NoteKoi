"use client";

import { useQuery } from "@tanstack/react-query";
import { getContentGaps, getDedupSavings, getCRThroughput } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";

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

  const safeGaps = Array.isArray(contentGaps) ? contentGaps : [];
  const safeThroughput = Array.isArray(crThroughput) ? crThroughput : [];
  const totalThroughput = safeThroughput.reduce((sum, c) => sum + (c.approved ?? 0) + (c.rejected ?? 0), 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Manage</p>
        <h1 className="mt-2 text-[26px] font-semibold text-[var(--ink)]">Analytics</h1>
        <p className="mt-1 max-w-2xl text-[12px] text-[var(--ink-soft)]">
          Platform and moderation performance metrics for your college.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Content Gaps */}
        <Card className="p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">Content Gaps</p>
          <p className="mt-3 text-[30px] font-bold text-[var(--ink)]">
            {loadingGaps ? "—" : safeGaps.length}
          </p>
          <p className="mt-1 text-[12px] text-[var(--ink-soft)]">Departments with low resource coverage</p>
          {!loadingGaps && safeGaps.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-[var(--line-soft)] pt-3">
              {safeGaps.slice(0, 3).map((g) => (
                <div key={g.departmentId} className="flex justify-between text-[12px]">
                  <span className="text-[var(--ink-soft)]">{g.name}</span>
                  <span className="font-medium text-[var(--ink)]">{g.resourceCount}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Dedup Savings */}
        <Card className="p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">Dedup Savings</p>
          <p className="mt-3 text-[30px] font-bold text-[var(--ink)]">
            {loadingDedup ? "—" : (dedupSavings?.saved ?? 0)}
          </p>
          <p className="mt-1 text-[12px] text-[var(--ink-soft)]">
            Duplicate files prevented out of {loadingDedup ? "—" : (dedupSavings?.totalChecked ?? 0)} checked
          </p>
        </Card>

        {/* CR Throughput */}
        <Card className="p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">CR Throughput</p>
          <p className="mt-3 text-[30px] font-bold text-[var(--ink)]">
            {loadingThroughput ? "—" : totalThroughput}
          </p>
          <p className="mt-1 text-[12px] text-[var(--ink-soft)]">Total moderation actions across all CRs</p>
          {!loadingThroughput && safeThroughput.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-[var(--line-soft)] pt-3">
              {safeThroughput.slice(0, 3).map((c) => (
                <div key={c.crId} className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--ink-soft)] truncate max-w-[120px]">{c.name ?? c.crId}</span>
                  <div className="flex gap-2">
                    <span className="font-medium text-[#2f9e52]">{c.approved}✓</span>
                    <span className="font-medium text-[#d24545]">{c.rejected}✗</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <UpcomingFeatureCard
          title="Saved Views aren't available yet"
          description="Saving custom table filters and column preferences requires a backend persistence endpoint that doesn't exist yet."
        />
      </div>
    </section>
  );
}
