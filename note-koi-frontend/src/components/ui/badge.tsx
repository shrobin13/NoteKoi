import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "state" | "visibility" | "role";
  tone?: string;
  icon?: ReactNode;
}

const toneToCssClass: Record<string, string> = {
  pending:    "badge-tone-pending",
  review:     "badge-tone-review",
  approved:   "badge-tone-approved",
  rejected:   "badge-tone-rejected",
  superseded: "badge-tone-super",
  deletion:   "badge-tone-deletion",
  deleted:    "badge-tone-deleted",
  platform:   "badge-tone-platform",
  college:    "badge-tone-college",
  role:       "badge-tone-role",
  // legacy aliases
  amber:  "badge-tone-pending",
  blue:   "badge-tone-review",
  green:  "badge-tone-approved",
  red:    "badge-tone-rejected",
  violet: "badge-tone-platform",
  slate:  "badge-tone-super",
  orange: "badge-tone-deletion",
  gray:   "badge-tone-super",
  indigo: "badge-tone-platform",
};

export function Badge({ className, variant = "state", tone, icon, ...props }: BadgeProps) {
  const resolvedTone =
    tone ||
    (variant === "role" ? "role" : variant === "visibility" ? "college" : "slate");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[20px] px-2 py-0.5 text-[10px] font-bold tracking-[0.02em]",
        toneToCssClass[resolvedTone] ?? "badge-tone-super",
        className
      )}
      {...props}
    >
      {icon}
      {props.children}
    </span>
  );
}
