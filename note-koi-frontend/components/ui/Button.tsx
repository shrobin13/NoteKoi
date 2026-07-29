"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  ghost: "btn btn-ghost",
  danger: "btn btn-primary bg-red-600 hover:bg-red-700",
  accent: "btn btn-accent",
};

const sizeClasses: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  icon,
  iconRight,
  fullWidth,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
      className={clsx(
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full justify-center",
        (disabled || loading) && "opacity-60 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          style={{ animation: "spin 0.7s linear infinite" }}
        />
      ) : (
        icon
      )}
      {children}
      {iconRight && !loading && iconRight}
    </motion.button>
  );
}
