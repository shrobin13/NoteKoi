"use client";
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ className, width, height, rounded, style }: SkeletonProps) {
  return (
    <div
      className={clsx("shimmer", rounded ? "rounded-full" : "rounded-2xl", className)}
      style={{ width, height: height ?? "1em", ...style }}
    />
  );
}

export function ResourceCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <Skeleton height="12px" width="60%" />
      <Skeleton height="20px" width="80%" />
      <Skeleton height="14px" width="40%" />
      <div className="flex gap-2 mt-2">
        <Skeleton height="28px" width="80px" className="rounded-full" />
        <Skeleton height="28px" width="64px" className="rounded-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-6 flex flex-col gap-3">
      <Skeleton height="12px" width="50%" />
      <Skeleton height="36px" width="70%" />
      <Skeleton height="12px" width="40%" />
    </div>
  );
}
