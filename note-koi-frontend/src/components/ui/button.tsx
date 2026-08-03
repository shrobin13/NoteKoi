import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-400",
  secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-slate-500",
  destructive: "bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-400",
  ghost: "bg-transparent text-slate-100 hover:bg-slate-800 focus-visible:ring-slate-500"
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
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
