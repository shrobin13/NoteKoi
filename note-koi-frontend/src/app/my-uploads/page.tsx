"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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
  { state: "PENDING", label: "Pending Review", tone: "text-amber-400" },
  { state: "IN_REVIEW", label: "In Review", tone: "text-blue-400" },
  { state: "APPROVED", label: "Approved & Published", tone: "text-green-400" },
  { state: "REJECTED", label: "Rejected", tone: "text-rose-400" },
  { state: "DELETION_REQUESTED", label: "Deletion Requested", tone: "text-orange-400" },
  { state: "SUPERSEDED", label: "Superseded (Old Version)", tone: "text-slate-400" },
  { state: "DELETED", label: "Deleted", tone: "text-slate-500" },
];

/**
 * My Uploads Dashboard — Milestone 4 task 2 / wireframe B.13
 * List user's resources grouped by Status.
 * Actions available per state:
 * - Cancel (Pending)
 * - Flag for Deletion (In Review)
 * - Request Deletion (Approved)
 * - Add New Version (Approved)
 * - Edit Metadata (Pending, In Review, Approved)
 * - View Version History (all states)
 */
export default function MyUploadsPage() {
  const qc = useQueryClient();
  const { user, isLoading: isLoadingUser, error: authError } = useRequireAuth();
  const { data: resourcesData, isLoading, error } = useMyUploadsQuery(1, 100);

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
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">My Uploads</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your uploaded resources</h1>
        </div>
        <Card className="h-60 rounded-3xl border border-slate-800/80 bg-slate-900/80 animate-pulse" />
      </section>
    );
  }

  if (authError || !user) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">My Uploads</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">My uploaded resources</h1>
          <p className="mt-2 text-slate-300">Please sign in to view your uploads.</p>
        </div>
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
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">My Uploads</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Your uploaded resources</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Track published resources, manage upload status, request deletion, or submit new versions.
          </p>
        </div>
        <Link href="/upload">
          <Button>+ Upload New Resource</Button>
        </Link>
      </div>

      {!hasAnyUploads ? (
        <Card className="space-y-4 border-slate-700/80 bg-slate-900/80 p-8 text-center">
          <p className="text-lg font-semibold text-white">No uploads yet</p>
          <p className="text-sm text-slate-300">Share class notes, lecture slides, or exam prep materials with your batch.</p>
          <div className="pt-2">
            <Link href="/upload"><Button>Upload a resource</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {STATE_GROUPS.map((group) => {
            const groupItems = itemsByState.get(group.state) ?? [];
            if (groupItems.length === 0) return null;

            return (
              <div key={group.state} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <h2 className={`text-lg font-semibold ${group.tone}`}>{group.label}</h2>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                    {groupItems.length}
                  </span>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {groupItems.map((resource) => (
                    <Card key={resource.id} className="flex flex-col justify-between p-6 space-y-4">
                      <ResourceCard {...resource} />

                      {/* Per-state Action Toolbar — Milestone 4 task 2 */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                        {/* Cancel (Pending) */}
                        {resource.state === "PENDING" && (
                          <Button
                            variant="destructive"
                            className="text-xs py-1.5 px-3"
                            disabled={selfCancelMutation.isPending}
                            onClick={() => selfCancelMutation.mutate(resource.id)}
                          >
                            Cancel Upload
                          </Button>
                        )}

                        {/* Flag for Deletion (In Review) */}
                        {resource.state === "IN_REVIEW" && !resource.deletionFlag && (
                          <Button
                            variant="destructive"
                            className="text-xs py-1.5 px-3"
                            disabled={flagDeletionMutation.isPending}
                            onClick={() => flagDeletionMutation.mutate(resource.id)}
                          >
                            Flag for Deletion
                          </Button>
                        )}

                        {/* Request Deletion (Approved) */}
                        {resource.state === "APPROVED" && (
                          <Button
                            variant="destructive"
                            className="text-xs py-1.5 px-3"
                            disabled={requestDeletionMutation.isPending}
                            onClick={() => requestDeletionMutation.mutate(resource.id)}
                          >
                            Request Deletion
                          </Button>
                        )}

                        {/* Add New Version (Approved) */}
                        {resource.state === "APPROVED" && (
                          <Link href={`/upload?versionOf=${resource.id}`}>
                            <Button variant="secondary" className="text-xs py-1.5 px-3">
                              + Add New Version
                            </Button>
                          </Link>
                        )}

                        {/* Resubmit (Rejected) */}
                        {resource.state === "REJECTED" && (
                          <Button
                            variant="secondary"
                            className="text-xs py-1.5 px-3"
                            disabled={resubmitMutation.isPending}
                            onClick={() => resubmitMutation.mutate(resource.id)}
                          >
                            Resubmit for Review
                          </Button>
                        )}

                        {/* Edit Metadata */}
                        {(resource.state === "PENDING" || resource.state === "IN_REVIEW" || resource.state === "APPROVED") && (
                          <Button
                            variant="ghost"
                            className="text-xs py-1.5 px-3 text-slate-300 hover:text-white"
                            onClick={() => openEditModal(resource)}
                          >
                            Edit Metadata
                          </Button>
                        )}

                        {/* Version History */}
                        <Link href={`/resources/${resource.id}/versions`}>
                          <Button variant="ghost" className="text-xs py-1.5 px-3 text-slate-400 hover:text-slate-200">
                            Version History
                          </Button>
                        </Link>
                      </div>
                    </Card>
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
        description="Update resource details. Structural edits to course assignment return the resource to Pending review."
        onClose={() => setEditTarget(null)}
      >
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Title</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Description</span>
            <textarea
              className="min-h-[90px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-slate-200">Tags (comma separated)</span>
            <input
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-500"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
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
