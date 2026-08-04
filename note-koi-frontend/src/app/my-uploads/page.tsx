"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/shared/resource-card";
import { useMyUploadsQuery } from "@/hooks/useMyUploadsQuery";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  useSelfCancelMutation,
  useFlagDeletionMutation,
  useRequestDeletionMutation,
  useResubmitMutation,
} from "@/hooks/useResourceActionMutations";
import { patchMetadata } from "@/lib/api/resources";
import { Resource, ResourceState } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

const STATE_GROUPS: { state: ResourceState; label: string; tone: string }[] = [
  { state: "PENDING", label: "Pending Review", tone: "pending" },
  { state: "IN_REVIEW", label: "In Review", tone: "review" },
  { state: "APPROVED", label: "Approved & Published", tone: "approved" },
  { state: "REJECTED", label: "Rejected", tone: "rejected" },
  { state: "DELETION_REQUESTED", label: "Deletion Requested", tone: "deletion" },
  { state: "SUPERSEDED", label: "Superseded", tone: "superseded" },
  { state: "DELETED", label: "Deleted", tone: "deleted" },
];

const inputCls =
  "w-full rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[12px] text-[var(--ink)] outline-none transition focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

export default function MyUploadsPage() {
  const qc = useQueryClient();
  const { user, isLoading: isLoadingUser, error: authError } = useRequireAuth();
  const { data: resourcesData, isLoading } = useMyUploadsQuery(1, 100);

  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const selfCancelMutation = useSelfCancelMutation();
  const flagDeletionMutation = useFlagDeletionMutation();
  const requestDeletionMutation = useRequestDeletionMutation();
  const resubmitMutation = useResubmitMutation();

  const itemsByState = useMemo(() => {
    const map = new Map<ResourceState, Resource[]>();
    for (const g of STATE_GROUPS) map.set(g.state, []);
    if (resourcesData?.items) {
      for (const item of resourcesData.items) {
        const list = map.get(item.state) ?? [];
        list.push(item);
        map.set(item.state, list);
      }
    }
    return map;
  }, [resourcesData?.items]);

  if (isLoadingUser || isLoading) {
    return (
      <section className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">Your uploaded resources</h1>
        <div className="h-40 animate-pulse rounded-[12px] border border-[var(--line-soft)] bg-[var(--ph)]" />
      </section>
    );
  }

  if (authError || !user) {
    return (
      <section className="mx-auto max-w-5xl">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">Your uploaded resources</h1>
        <p className="mt-2 text-[12.5px] text-[var(--ink-soft)]">Please sign in to view your uploads.</p>
      </section>
    );
  }

  function openEditModal(resource: Resource) {
    setEditTarget(resource);
    setEditTitle(resource.title);
    setEditDesc(resource.description ?? "");
    setEditTags(resource.tags?.join(", ") ?? "");
  }

  async function handleSaveMetadata() {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await patchMetadata(editTarget.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      qc.invalidateQueries({ queryKey: ["resources", "my-uploads"] });
      setEditTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setEditSaving(false);
    }
  }

  const hasAnyUploads = (resourcesData?.items?.length ?? 0) > 0;

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--ink-soft)]">My Uploads</p>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--ink)]">Your uploaded resources</h1>
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            Track published resources, manage upload status, and submit new versions.
          </p>
        </div>
        <Link href="/upload">
          <Button>+ Upload New Resource</Button>
        </Link>
      </div>

      {!hasAnyUploads ? (
        <div className="rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-10 text-center space-y-3">
          <p className="text-[15px] font-semibold text-[var(--ink)]">No uploads yet</p>
          <p className="text-[12.5px] text-[var(--ink-soft)]">Share class notes, slides, or exam materials with your batch.</p>
          <Link href="/upload"><Button>Upload a resource</Button></Link>
        </div>
      ) : (
        <div className="space-y-8">
          {STATE_GROUPS.map((group) => {
            const groupItems = itemsByState.get(group.state) ?? [];
            if (groupItems.length === 0) return null;

            return (
              <div key={group.state} className="space-y-3">
                <div className="flex items-center gap-2.5 border-b border-[var(--line-soft)] pb-2">
                  <Badge tone={group.tone}>{group.label}</Badge>
                  <span className="rounded-full bg-[var(--ph)] px-2 py-0.5 text-[10px] font-bold text-[var(--ink-soft)]">
                    {groupItems.length}
                  </span>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {groupItems.map((resource) => (
                    <div key={resource.id} className="rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-3 space-y-3">
                      <ResourceCard {...resource} showState />

                      {/* Per-state actions */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line-soft)] pt-2">
                        {resource.state === "PENDING" && (
                          <Button
                            variant="destructive"
                            className="py-1 px-3 text-[11px]"
                            disabled={selfCancelMutation.isPending}
                            onClick={() => selfCancelMutation.mutate(resource.id)}
                          >
                            Cancel Upload
                          </Button>
                        )}
                        {resource.state === "IN_REVIEW" && !resource.deletionFlag && (
                          <Button
                            variant="destructive"
                            className="py-1 px-3 text-[11px]"
                            disabled={flagDeletionMutation.isPending}
                            onClick={() => flagDeletionMutation.mutate(resource.id)}
                          >
                            Flag for Deletion
                          </Button>
                        )}
                        {resource.state === "APPROVED" && (
                          <Button
                            variant="destructive"
                            className="py-1 px-3 text-[11px]"
                            disabled={requestDeletionMutation.isPending}
                            onClick={() => requestDeletionMutation.mutate(resource.id)}
                          >
                            Request Deletion
                          </Button>
                        )}
                        {resource.state === "APPROVED" && (
                          <Link href={`/upload?versionOf=${resource.id}`}>
                            <Button variant="secondary" className="py-1 px-3 text-[11px]">+ New Version</Button>
                          </Link>
                        )}
                        {resource.state === "REJECTED" && (
                          <Button
                            variant="secondary"
                            className="py-1 px-3 text-[11px]"
                            disabled={resubmitMutation.isPending}
                            onClick={() => resubmitMutation.mutate(resource.id)}
                          >
                            Resubmit
                          </Button>
                        )}
                        {(resource.state === "PENDING" || resource.state === "IN_REVIEW" || resource.state === "APPROVED") && (
                          <Button
                            variant="ghost"
                            className="py-1 px-3 text-[11px]"
                            onClick={() => openEditModal(resource)}
                          >
                            Edit Metadata
                          </Button>
                        )}
                        <Link href={`/resources/${resource.id}/versions`}>
                          <Button variant="ghost" className="py-1 px-3 text-[11px]">Version History</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Metadata Modal */}
      <Dialog
        open={!!editTarget}
        title="Edit Resource Metadata"
        description="Update resource details. Structural edits return the resource to Pending review."
        onClose={() => setEditTarget(null)}
      >
        <div className="mt-4 space-y-3">
          <label className="block space-y-1 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Title</span>
            <input className={inputCls} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          </label>
          <label className="block space-y-1 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Description</span>
            <textarea className={`${inputCls} min-h-[80px]`} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
          </label>
          <label className="block space-y-1 text-[12px]">
            <span className="font-medium text-[var(--ink)]">Tags (comma separated)</span>
            <input className={inputCls} value={editTags} onChange={(e) => setEditTags(e.target.value)} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleSaveMetadata} disabled={!editTitle.trim() || editSaving}>
              {editSaving ? "Saving…" : "Save Metadata"}
            </Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
