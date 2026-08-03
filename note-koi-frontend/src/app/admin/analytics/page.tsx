"use client";

import { useQuery } from "@tanstack/react-query";
import { getPromotionsByCollege, getOverrideLogs } from "@/lib/api/admin";
import { Card } from "@/components/ui/card";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";

/**
 * Platform Analytics & Override Log — Milestone 7 task 6 / wireframe B.26
 * Metrics: Promotions by college
 * Table log of all overrides (actor, target, action, timestamp, justification)
 * Saved Views → UpcomingFeatureCard per wirefram-resolution.md §1 OQ#10
 */
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Administration</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Platform Analytics & Override Logs</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Global platform promotion stats and audit log for administrative overrides.
        </p>
      </div>

      {/* Promotions by College */}
      <Card className="mb-8 border-slate-700/80 bg-slate-900/80 p-6">
        <h2 className="text-lg font-semibold text-white">Promotions by College</h2>
        <p className="mt-1 text-sm text-slate-400">Platform-wide promotions count grouped by college</p>

        {loadingPromotions ? (
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-slate-800/60" />
        ) : !promotions?.length ? (
          <p className="mt-4 text-sm text-slate-500">No promotion statistics recorded yet.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {promotions.map((p) => (
              <div key={p.collegeId} className="rounded-2xl bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{p.name}</p>
                <p className="mt-2 text-2xl font-bold text-white">{p.count}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Override Logs Table */}
      <Card className="mb-8 border-slate-700/80 bg-slate-900/80 p-6">
        <h2 className="text-lg font-semibold text-white">Override Log</h2>
        <p className="mt-1 text-sm text-slate-400">Immutable audit record of all administrative overrides</p>

        {loadingLogs ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-800/60" />
            ))}
          </div>
        ) : !overrideLogs?.length ? (
          <p className="mt-4 text-sm text-slate-500">No override logs recorded.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overrideLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-white">{log.actor}</td>
                    <td className="py-3 px-4 text-slate-300">{log.target}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs text-slate-300 max-w-xs truncate">{log.justification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Saved Views — UpcomingFeatureCard per wirefram-resolution.md §1 OQ#10 */}
      <UpcomingFeatureCard
        title="Saved Views aren't available yet"
        description="Saving custom filters and view configurations for override logs requires a backend persistence endpoint that doesn't exist yet."
      />
    </section>
  );
}
