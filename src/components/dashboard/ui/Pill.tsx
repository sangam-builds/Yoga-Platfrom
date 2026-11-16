"use client";

import React from "react";

export type PillVariant =
  | "attended"
  | "late"
  | "missed"
  | "excused"
  | "active"
  | "trialing"
  | "paused"
  | "past_due"
  | "default";

interface PillProps {
  children: React.ReactNode;
  variant?: PillVariant | string;
  size?: "sm" | "md";
  className?: string;
  icon?: React.ReactNode;
}

export function Pill({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon,
}: PillProps) {
  const norm = String(variant).toLowerCase();

  const variantStyles: Record<string, string> = {
    attended: "bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] border-transparent",
    active: "bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] border-transparent",
    trialing: "bg-[var(--info-teal-tint)] text-[var(--info-teal)] border-transparent",
    late: "bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] border-transparent",
    missed: "bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] border-transparent",
    past_due: "bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] border-transparent",
    paused: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
    excused: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]",
    default: "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-subtle)]",
  };

  const style = variantStyles[norm] || variantStyles.default;
  const sizeStyle = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-figtree font-semibold border leading-none transition-colors ${sizeStyle} ${style} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
