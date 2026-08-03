import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[16px] border border-slate-700/60 bg-slate-900/80 p-4 shadow-sm backdrop-blur-sm",
        variant === "elevated" && "shadow-xl",
        className
      )}
      {...props}
    />
  );
}
