"use client";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
  layoutId?: string;
  as?: "div" | "article" | "section";
  style?: React.CSSProperties;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className,
  hover = true,
  padding = "md",
  onClick,
  layoutId,
  as: Tag = "div",
  style,
}: CardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      style={style}
      whileHover={
        hover
          ? { y: -3, boxShadow: "0 20px 60px rgba(143,191,159,0.25), 0 8px 32px rgba(53,53,53,0.08)" }
          : {}
      }
      whileTap={onClick ? { scale: 0.99 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={clsx(
        "card",
        paddingMap[padding],
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
