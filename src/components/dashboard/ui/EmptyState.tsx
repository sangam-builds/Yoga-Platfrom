"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <Sparkles className="w-6 h-6 text-[var(--primary-sage)]" />,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center mb-4 shadow-2xs">
        {icon}
      </div>
      <h3 className="font-outfit font-semibold text-lg text-[var(--text-primary)] mb-1">
        {title}
      </h3>
      <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
