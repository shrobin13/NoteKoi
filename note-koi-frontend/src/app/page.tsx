"use client";

import Link from "next/link";
import { ResourceCard } from "@/components/shared/resource-card";
import { Card } from "@/components/ui/card";
import { useResourcesQuery } from "@/hooks/useResourcesQuery";

/**
 * Discover / Home Hub — Milestone 3 task 1 / wireframe B.7
 * Replaces misapplied UpcomingFeatureCard on Browse (per P2 audit findings & wirefram-resolution.md §4 row B.9)
 * with actual department/session/course navigation structure linking to Hierarchical Browse.
 */
export default function Home() {
  const { data, isLoading } = useResourcesQuery({ limit: 6 });
  const featuredResources = data?.items ?? [];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Discover</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Browse the latest resources</h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Explore shared notes, lecture slides, and exam prep materials. Resources are reviewed and published by the student community.
          </p>
        </div>

        {/* Hierarchical Browse Navigation Hub — Milestone 3 task 2 */}
        <Card className="border-slate-700/80 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Browse by Department & Course</h2>
            <span className="text-xs text-indigo-400">Hierarchical Navigation</span>
          </div>
          <p className="text-sm text-slate-400">Select a department to drill down into sessions and courses:</p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { dept: "CSE", name: "Computer Science & Engineering", id: "cse" },
              { dept: "EEE", name: "Electrical & Electronic Engineering", id: "eee" },
              { dept: "ME", name: "Mechanical Engineering", id: "me" },
            ].map((d) => (
              <Link
                key={d.id}
                href={`/departments/${d.id}/sessions/2024/courses/CS101`}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <p className="font-bold text-indigo-400">{d.dept}</p>
                <p className="mt-1 text-xs text-slate-300">{d.name}</p>
                <p className="mt-3 text-[11px] text-slate-500">Explore Courses →</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Highlights Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Recent Platform Highlights</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-64 animate-pulse rounded-3xl border border-slate-800/80 bg-slate-900/80" />
                ))
              : featuredResources.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
          </div>
        </div>
      </section>
    </main>
  );
}
