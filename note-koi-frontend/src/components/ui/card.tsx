import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-[var(--line-soft)] bg-[var(--paper)] p-3",
        variant === "elevated" && "shadow-lg",
        className
      )}
      {...props}
    />
  );
}
