"use client";

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-[var(--border-hairline)]/60 ${className}`}
    />
  );
}

export function CardSkeleton({ height = "h-40", className = "" }: { height?: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 animate-pulse ${height} ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-1/3 h-4" />
      <Skeleton className="w-1/2 h-8" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}
