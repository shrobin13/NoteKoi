import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "state" | "visibility" | "role";
  tone?: string;
  icon?: ReactNode;
}

export function Badge({ className, variant = "state", tone, icon, ...props }: BadgeProps) {
  const variantTone = {
    state: "slate",
    visibility: "violet",
    role: "indigo"
  } as const;

  const toneClasses = {
    slate: "bg-slate-700 text-slate-100",
    indigo: "bg-indigo-600 text-white",
    green: "bg-emerald-600 text-white",
    amber: "bg-amber-500 text-slate-950",
    red: "bg-rose-600 text-white",
    violet: "bg-violet-600 text-white",
    gray: "bg-slate-600 text-white"
  } as const;

  const resolvedTone = tone || variantTone[variant] || "slate";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        toneClasses[resolvedTone as keyof typeof toneClasses],
        className
      )}
      {...props}
    >
      {icon}
      {props.children}
    </span>
  );
}
