import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[var(--accent)] text-white hover:opacity-90 active:scale-[.97]",
  secondary: "bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--ph)]",
  ghost: "bg-transparent text-[var(--ink-soft)] hover:bg-[var(--ph)] border border-transparent",
  destructive: "bg-[var(--paper)] text-[#d24545] border border-[#d24545] hover:bg-[#fbe6e6] active:scale-[.97]",
} as const;

type ButtonVariant = keyof typeof variants;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[8px] px-4 py-2 text-[12px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
