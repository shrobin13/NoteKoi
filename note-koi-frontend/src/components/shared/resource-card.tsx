import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ResourceState, ResourceType, ResourceUploader, Visibility } from "@/lib/types";

interface ResourceCardProps {
  id: string;
  title: string;
  description?: string | null;
  type?: ResourceType | null;
  resourceType?: ResourceType | null;
  visibility: Visibility;
  uploader?: ResourceUploader | null;
  createdAt: string;
  state: ResourceState;
  showState?: boolean;
}

const stateTone: Record<ResourceState, string> = {
  PENDING: "pending",
  IN_REVIEW: "review",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUPERSEDED: "superseded",
  DELETION_REQUESTED: "deletion",
  DELETED: "deleted",
};

const stateLabel: Record<ResourceState, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUPERSEDED: "Superseded",
  DELETION_REQUESTED: "Deletion Requested",
  DELETED: "Deleted",
};

const typeLabel: Record<ResourceType, string> = {
  CLASS_NOTES: "Class Notes",
  LECTURE_NOTES: "Lecture Notes",
  SYLLABUS: "Syllabus",
  PYQ: "PYQ",
  BOOK_PDF: "Book PDF",
  VIDEO: "Video",
};

export function ResourceCard({
  id,
  title,
  type,
  resourceType,
  visibility,
  uploader,
  createdAt,
  state,
  showState = false,
}: ResourceCardProps) {
  const resolvedType = type ?? resourceType;
  const uploaderLabel = uploader?.name ?? uploader?.email ?? "Unknown";

  return (
    <Link
      href={`/resources/${id}`}
      className="group block rounded-[12px] border border-[var(--line-soft)] bg-[var(--paper)] p-3 transition-shadow hover:shadow-md"
    >
      {/* Thumbnail placeholder */}
      <div className="mb-2.5 h-[70px] w-full rounded-[8px] bg-[var(--ph)]" />

      {/* Badges */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        {showState && <Badge tone={stateTone[state]}>{stateLabel[state]}</Badge>}
        <Badge tone={visibility === "PLATFORM" ? "platform" : "college"}>
          {visibility === "PLATFORM" ? "Platform" : "College"}
        </Badge>
      </div>

      {/* Title */}
      <div className="text-[13px] font-bold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">
        {title}
      </div>

      {/* Meta */}
      <div className="mt-1.5 text-[11px] text-[var(--ink-soft)]">
        {(resolvedType ? (typeLabel[resolvedType] ?? resolvedType) : "Resource")} · {uploaderLabel}
      </div>
    </Link>
  );
}
