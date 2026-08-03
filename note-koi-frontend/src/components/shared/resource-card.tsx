import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ResourceState, ResourceType, User, Visibility } from "@/lib/types";

interface ResourceCardProps {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  visibility: Visibility;
  uploader: Pick<User, "id" | "name" | "role">;
  createdAt: string;
  state: ResourceState;
}

const stateToneMap: Record<ResourceCardProps["state"], string> = {
  PENDING: "amber",
  IN_REVIEW: "blue",
  APPROVED: "green",
  REJECTED: "red",
  SUPERSEDED: "slate",
  DELETION_REQUESTED: "orange",
  DELETED: "slate"
};

const visibilityToneMap: Record<Visibility, string> = {
  PLATFORM: "violet",
  COLLEGE: "slate"
};

export function ResourceCard({ id, title, description, type, visibility, uploader, createdAt, state }: ResourceCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between gap-6 p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={stateToneMap[state]}>{state.replace("_", " ")}</Badge>
          <Badge tone={visibilityToneMap[visibility]} variant="visibility">
            {visibility === "PLATFORM" ? "Platform" : "College"}
          </Badge>
          <span className="rounded-full border border-slate-800/80 bg-slate-950/80 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
            {type.replace("_", " ")}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
        <div>
          <p>Uploaded by</p>
          <p className="text-slate-100">{uploader.name ?? uploader.id}</p>
        </div>
        <div>
          <p>Created</p>
          <p className="text-slate-100">{createdAt}</p>
        </div>
      </div>
      <Link href={`/resources/${id}`} className="inline-flex">
        <Button variant="secondary">View details</Button>
      </Link>
    </Card>
  );
}
