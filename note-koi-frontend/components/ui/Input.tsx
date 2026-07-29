"use client";
import { forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper flex items-center">
        {leftIcon && (
          <span
            className="absolute left-3.5 flex items-center"
            style={{ color: "var(--text-subtle)", pointerEvents: "none" }}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "input-field",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-red-400 focus:!border-red-500 focus:!shadow-[0_0_0_4px_rgba(239,68,68,0.1)]",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span
            className="absolute right-3.5 flex items-center"
            style={{ color: "var(--text-subtle)" }}
          >
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          {hint}
        </p>
      )}
    </div>
  );
});
