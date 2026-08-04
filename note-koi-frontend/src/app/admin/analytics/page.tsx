"use client";

import { useQuery } from "@tanstack/react-query";
import { getPromotionsByCollege, getOverrideLogs } from "@/lib/api/admin";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";

export default function AdminAnalyticsPage() {
  const { data: promotions, isLoading: loadingPromotions } = useQuery({
    queryKey: ["platform-analytics", "promotions"],
    queryFn: getPromotionsByCollege,
    staleTime: 1000 * 60 * 10,
  });

  const { data: overrideLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ["platform-analytics", "override-logs"],
    queryFn: getOverrideLogs,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Administration</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Platform Analytics & Override Logs</h1>
        <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
          Global promotion stats and immutable audit log for administrative overrides.
        </p>
      </div>

      {/* Promotions by College */}
      <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-5 space-y-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">Promotions by College</h2>
          <p className="text-[11.5px] text-[var(--ink-soft)]">Platform-wide promotion counts grouped by college</p>
        </div>

        {loadingPromotions ? (
          <div className="h-20 animate-pulse rounded-[8px] bg-[var(--ph)]" />
        ) : !promotions?.length ? (
          <p className="text-[12px] text-[var(--ink-soft)]">No promotion statistics recorded yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {promotions.map((p) => (
              <div key={p.collegeId} className="rounded-[8px] border border-[var(--line-soft)] bg-[var(--canvas)] p-4">
                <p className="text-[10.5px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">{p.name}</p>
                <p className="mt-2 text-[24px] font-bold text-[var(--ink)]">{p.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Override Logs */}
      <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-5 space-y-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--ink)]">Override Log</h2>
          <p className="text-[11.5px] text-[var(--ink-soft)]">Immutable audit record of all administrative overrides</p>
        </div>

        {loadingLogs ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-[8px] bg-[var(--ph)]" />
            ))}
          </div>
        ) : !overrideLogs?.length ? (
          <p className="text-[12px] text-[var(--ink-soft)]">No override logs recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] text-[var(--ink-soft)]">
              <thead className="border-b border-[var(--line-soft)] text-[10.5px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                <tr>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line-soft)]">
                {overrideLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--ph)]">
                    <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{log.actor}</td>
                    <td className="py-2.5 px-3">{log.target}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-[20px] bg-[var(--ph)] px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--ink)]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate">{log.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UpcomingFeatureCard
        title="Saved Views aren't available yet"
        description="Saving custom filters and view configurations for override logs requires a backend persistence endpoint that doesn't exist yet."
      />
    </section>
  );
}
