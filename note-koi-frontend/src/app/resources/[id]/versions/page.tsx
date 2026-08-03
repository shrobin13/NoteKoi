"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useResourceVersionsQuery } from "@/hooks/useResourceVersionsQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";

interface VersionsPageProps {
  params: {
    id: string;
  };
}

/**
 * Version History Screen — Milestone 3 task 5 / wireframe B.11
 * Route: /resources/[id]/versions
 * Vertical timeline list. Current version anchored top.
 * Rejected versions dimmed/locked for unauthorized roles (Guest / Student).
 */
export default function ResourceVersionsPage({ params }: VersionsPageProps) {
  const { id } = params;
  const router = useRouter();
  const { data: versions, isLoading, error } = useResourceVersionsQuery(id);
  const { data: user } = useUsersQuery();

  const isPrivileged =
    user?.role === "CR" ||
    user?.role === "CO_CR" ||
    user?.role === "SUB_ADMIN" ||
    user?.role === "PLATFORM_ADMIN";

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resource</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Version History</h1>
          <p className="mt-2 text-sm text-slate-400">
            Timeline of all published and past revisions of this resource.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          ← Back to Resource
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-900/80 border border-slate-800/80" />
          ))}
        </div>
      ) : error || !versions?.length ? (
        <Card className="border-slate-700/80 bg-slate-900/80 p-8">
          <p className="text-center text-slate-300">
            No version history found or available for this resource.
          </p>
        </Card>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {versions.map((ver, idx) => {
            const isLatest = idx === 0;
            const isRejected = ver.state === "REJECTED";
            const isDimmed = isRejected && !isPrivileged && user?.id !== ver.uploader.id;

            return (
              <div key={ver.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[31px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-slate-950 text-xs font-bold ${
                    isLatest
                      ? "border-indigo-500 text-indigo-400"
                      : isRejected
                      ? "border-rose-500/60 text-rose-400"
                      : "border-slate-700 text-slate-400"
                  }`}
                >
                  v{ver.version}
                </div>

                <Card
                  className={`border-slate-700/80 bg-slate-900/80 p-5 transition ${
                    isDimmed ? "opacity-40 grayscale pointer-events-none" : "hover:border-slate-600"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{ver.title}</h3>
                        {isLatest && (
                          <span className="rounded-full bg-indigo-900/60 border border-indigo-700/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-semibold">
                            Current Version
                          </span>
                        )}
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                          {ver.state.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Uploaded by {ver.uploader.name ?? ver.uploader.id} on{" "}
                        {new Date(ver.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {!isDimmed && (ver.fileUrl || ver.youtubeUrl) && (
                      <div className="flex gap-2">
                        {ver.fileUrl && (
                          <a
                            href={ver.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-slate-700"
                          >
                            Download
                          </a>
                        )}
                        {ver.youtubeUrl && (
                          <a
                            href={ver.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-slate-700"
                          >
                            Watch
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {isDimmed && (
                    <p className="mt-2 text-xs italic text-rose-400/80">
                      Rejected version — details hidden for unauthorized roles.
                    </p>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
