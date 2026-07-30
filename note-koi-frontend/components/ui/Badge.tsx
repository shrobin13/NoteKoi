"use client";
import { clsx } from "clsx";
import type { ResourceCategory, Visibility, Role, UserStatus } from "@/lib/types";

type BadgeVariant =
  | ResourceCategory
  | Visibility
  | Role
  | UserStatus
  | "success"
  | "warning"
  | "error"
  | "info"
  | "admin";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<string, string> = {
  Lecture: "badge badge-lecture",
  Notes: "badge badge-notes",
  PYQ: "badge badge-pyq",
  Tutorial: "badge badge-tutorial",
  Software: "badge badge-software",
  Other: "badge badge-other",
  PUBLIC: "badge badge-public",
  PRIVATE: "badge badge-private",
  VERIFIED: "badge badge-verified",
  UNVERIFIED: "badge badge-unverified",
  SUSPENDED: "badge" ,
  CR: "badge badge-cr",
  SUB_ADMIN: "badge badge-admin",
  OWNER_ADMIN: "badge badge-owner",
  STUDENT: "badge badge-other",
  admin: "badge badge-admin",
  success: "badge badge-verified",
  warning: "badge badge-pyq",
  error: "badge" ,
  info: "badge badge-cr",
};

export function Badge({ variant = "Other", children, className }: BadgeProps) {
  return (
    <span className={clsx(variantMap[variant] ?? "badge", className)}>
      {children}
    </span>
  );
}
