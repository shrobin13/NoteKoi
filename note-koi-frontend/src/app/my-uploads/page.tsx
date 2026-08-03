"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResourceCard } from "@/components/shared/resource-card";
import { useMyUploadsQuery } from "@/hooks/useMyUploadsQuery";

export default function MyUploadsPage() {
  const { data: resourcesData, isLoading, error } = useMyUploadsQuery(1, 100);

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">My Uploads</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Your uploaded resources</h1>
        <p className="mt-2 max-w-2xl text-slate-300">
          Track your published resources, edit details, and view upload status in one place.
        </p>
      </div>

      {isLoading ? (
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <div className="h-60 rounded-3xl bg-slate-950/70 p-6" />
        </Card>
      ) : error ? (
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <p className="text-sm text-slate-400">Unable to load your uploads. Please refresh the page or try again later.</p>
        </Card>
      ) : resourcesData?.items.length === 0 ? (
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <div className="rounded-3xl bg-slate-950/70 p-6 text-slate-300">
            <p className="text-sm font-semibold text-white">No uploads yet</p>
            <p className="mt-3 text-sm leading-6">
              Your upload history will appear here once you’ve shared resources.
            </p>
          </div>
          <Link href="/upload" className="inline-flex">
            <Button variant="secondary">Upload a resource</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {resourcesData?.items.map((resource) => (
            <ResourceCard key={resource.id} {...resource} />
          ))}
        </div>
      )}
    </section>
  );
}
