"use client";

import { useRouter } from "next/navigation";
import { useResourceVersionsQuery } from "@/hooks/useResourceVersionsQuery";
import { useUsersQuery } from "@/hooks/useUsersQuery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyStateBlock } from "@/components/shared/empty-state-block";

interface VersionsPageProps {
  params: { id: string };
}

const STATE_TONE: Record<string, string> = {
  PENDING: "pending",
  IN_REVIEW: "review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUPERSEDED: "superseded",
  DELETION_REQUESTED: "deletion",
  DELETED: "deleted",
};

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
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">Resource</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Version History</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            Timeline of all published and past revisions of this resource.
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
          ))}
        </div>
      ) : error || !versions?.length ? (
        <EmptyStateBlock
          title="No version history"
          description="No version history found or available for this resource."
          actionText="Back to Discover"
          actionHref="/"
        />
      ) : (
        <div className="relative ml-4 border-l-2 border-[var(--line-soft)] pl-6 space-y-5">
          {versions.map((ver, idx) => {
            const isLatest = idx === 0;
            const isRejected = ver.state === "REJECTED";
            const isDimmed = isRejected && !isPrivileged && user?.id !== ver.uploader?.id;

            return (
              <div key={ver.id} className="relative">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[31px] top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-[var(--paper)] text-[10px] font-bold ${
                    isLatest
                      ? "border-[var(--accent)] text-[var(--ink)]"
                      : isRejected
                      ? "border-[#d24545]/60 text-[#d24545]"
                      : "border-[var(--line)] text-[var(--ink-soft)]"
                  }`}
                >
                  v{ver.version}
                </div>

                <div
                  className={`rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-4 transition ${
                    isDimmed ? "pointer-events-none opacity-40 grayscale" : "hover:border-[var(--ink-soft)]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-[var(--ink)]">{ver.title}</span>
                        {isLatest && (
                          <Badge tone="review">Current</Badge>
                        )}
                        <Badge tone={STATE_TONE[ver.state] ?? "slate"}>{ver.state.replace(/_/g, " ")}</Badge>
                      </div>
                      <p className="text-[11.5px] text-[var(--ink-soft)]">
                        Uploaded by {ver.uploader?.name ?? ver.uploader?.email ?? "Unknown"} · {new Date(ver.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {!isDimmed && (ver.fileUrl || ver.youtubeUrl) && (
                      <div className="flex gap-2">
                        {ver.fileUrl && (
                          <a
                            href={ver.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-[11px] font-semibold text-[#3f6fd6] hover:bg-[var(--ph)] transition"
                          >
                            Download
                          </a>
                        )}
                        {ver.youtubeUrl && (
                          <a
                            href={ver.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-[11px] font-semibold text-[#d24545] hover:bg-[var(--ph)] transition"
                          >
                            Watch
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {isDimmed && (
                    <p className="mt-2 text-[11.5px] italic text-[#d24545]/80">
                      Rejected version — details hidden for unauthorized roles.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
