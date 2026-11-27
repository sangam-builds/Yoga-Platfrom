"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  X,
  Sparkles,
} from "lucide-react";
import { useUserState } from "@/components/onboarding/hooks/useUserState";

export function GettingStartedChecklist() {
  const { state, isLoading, dismissChecklist } = useUserState();
  const [isDismissing, setIsDismissing] = useState(false);

  if (isLoading || !state || !state.checklist.visible) {
    return null;
  }

  const { items, progressPercentage } = state.checklist;
  const completedCount = items.filter((i) => i.isCompleted).length;

  const handleDismiss = async () => {
    setIsDismissing(true);
    await dismissChecklist();
    setIsDismissing(false);
  };

  return (
    <div
      role="region"
      aria-label="Getting Started Checklist"
      className="p-5 sm:p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs relative transition-all duration-300 animate-fadeIn"
    >
      {/* Top Header: Title + Progress + Dismiss */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary-sage)] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GETTING STARTED</span>
          </div>
          <h2 className="font-outfit text-lg sm:text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Set up your practice foundation
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {completedCount} of {items.length} completed ({progressPercentage}%)
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={isDismissing}
            aria-label="Dismiss getting started checklist"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--border-hairline)] mb-5">
        <div
          className="h-full rounded-full bg-[var(--primary-sage)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Checklist Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.isCompleted
                  ? "bg-[var(--sage-tint)]/40 border-[var(--primary-sage)]/25"
                  : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--primary-sage)]/40"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--primary-sage)]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[var(--text-muted)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3
                    className={`font-outfit text-sm font-semibold truncate leading-snug ${
                      item.isCompleted
                        ? "text-[var(--text-muted)] line-through"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="font-figtree text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {!item.isCompleted && (
                <Link
                  href={item.actionUrl}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--primary-sage)] hover:bg-[var(--sage-tint)] transition-colors ml-2"
                  aria-label={`Complete ${item.title}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
