"use client";

import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div>
        {eyebrow && (
          <p className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase mb-1">
            {eyebrow}
          </p>
        )}
        <h2 className="font-outfit text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="font-figtree text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
