"use client";

import { ResourceCard } from "@/components/shared/resource-card";
import { UpcomingFeatureCard } from "@/components/shared/upcoming-feature-card";
import { useResourcesQuery } from "@/hooks/useResourcesQuery";

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

        <div className="grid gap-6 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-64 rounded-3xl border border-slate-800/80 bg-slate-900/80" />
              ))
            : featuredResources.map((resource) => (
                <ResourceCard key={resource.id} {...resource} />
              ))}
        </div>

        <UpcomingFeatureCard
          title="Course Collections"
          description="Curated collections of subjects, sessions, and department-specific resources are coming soon."
          details="Soon, you’ll be able to browse per department and course with advanced filtering."
        />
      </section>
    </main>
  );
}
