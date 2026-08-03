"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useResourceQuery } from "@/hooks/useResourceQuery";
import { ResourceCard } from "@/components/shared/resource-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";

interface ResourcePageProps {
  params: {
    id: string;
  };
}

export default function ResourcePage({ params }: ResourcePageProps) {
  const { id } = params;
  const { data: resource, isLoading, error } = useResourceQuery(id);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Loading resource</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Fetching the selected resource details...</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 rounded-3xl border border-slate-800/80 bg-slate-900/80" />
          <div className="h-64 rounded-3xl border border-slate-800/80 bg-slate-900/80" />
        </div>
      </section>
    );
  }

  if (error || !resource) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <EmptyStateBlock
          title="Resource not found"
          description="We couldn’t find that resource. It may have been removed or the link is incorrect."
          actionText="Back to Discover"
          actionHref="/"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{resource.title}</h1>
        <p className="mt-2 max-w-2xl text-slate-300">{resource.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="space-y-6 border-slate-700/80 bg-slate-900/80 p-6">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource details</p>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Type</span>
                <span className="font-semibold text-white">{resource.type.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Visibility</span>
                <span className="font-semibold text-white">{resource.visibility === "PLATFORM" ? "Platform" : "College"}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>State</span>
                <span className="font-semibold text-white">{resource.state.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Uploaded by</span>
                <span className="font-semibold text-white">{resource.uploader.name ?? resource.uploader.id}</span>
              </div>
              <div className="flex justify-between rounded-3xl bg-slate-950/70 p-4">
                <span>Created</span>
                <span className="font-semibold text-white">{resource.createdAt}</span>
              </div>
              {resource.tags?.length ? (
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <span className="text-sm text-slate-400">Tags</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {resource.fileUrl ? (
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <span className="text-sm text-slate-400">File</span>
                  <div className="mt-2">
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                    >
                      Download file
                    </a>
                  </div>
                </div>
              ) : null}
              {resource.youtubeUrl ? (
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <span className="text-sm text-slate-400">YouTube</span>
                  <div className="mt-2">
                    <a
                      href={resource.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
        </Card>

        <div className="space-y-6">
          <ResourceCard {...resource} />
        </div>
      </div>
    </section>
  );
}
