"use client";

import React from "react";
import { Check } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface OptionCardProps {
  id: string;
  label: string;
  description?: string;
  iconName?: string;
  selected: boolean;
  isMultiSelect?: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function OptionCard({
  id,
  label,
  description,
  iconName,
  selected,
  isMultiSelect = false,
  onSelect,
  disabled = false,
}: OptionCardProps) {
  // Dynamically resolve icon from Lucide if available
  const IconComponent = iconName
    ? (LucideIcons as Record<string, any>)[iconName]
    : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div
      role={isMultiSelect ? "checkbox" : "radio"}
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect(id)}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-start p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 select-none min-h-[64px] border ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${
        selected
          ? "bg-[var(--sage-tint)] border-[var(--primary-sage)] shadow-xs ring-1 ring-[var(--primary-sage)]/20"
          : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--primary-sage)]/50 hover:bg-[var(--bg-elevated)]"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)] focus-visible:ring-offset-2`}
    >
      {/* Icon or Avatar */}
      {IconComponent && (
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mr-3.5 transition-colors ${
            selected
              ? "bg-[var(--primary-sage)] text-[var(--on-primary)]"
              : "bg-[var(--bg-elevated)] text-[var(--primary-sage)] group-hover:bg-[var(--sage-tint)]"
          }`}
          aria-hidden="true"
        >
          <IconComponent className="w-5 h-5 stroke-[1.8]" />
        </div>
      )}

      {/* Text Info */}
      <div className="flex-1 pr-6">
        <div className="font-outfit text-sm sm:text-[15px] font-semibold text-[var(--text-primary)] leading-snug">
          {label}
        </div>
        {description && (
          <p className="font-figtree text-xs sm:text-[13px] text-[var(--text-muted)] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Selection Indicator Badge */}
      <div
        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          selected
            ? "bg-[var(--primary-sage)] text-[var(--on-primary)] scale-100"
            : "border border-[var(--border-subtle)] bg-[var(--bg-surface)] group-hover:border-[var(--primary-sage)]/60 scale-95"
        }`}
        aria-hidden="true"
      >
        {selected ? (
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
        )}
      </div>
    </div>
  );
}
