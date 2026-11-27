"use client";

import React from "react";

interface ProgressBarProps {
  currentStepIndex: number; // 1-based (e.g., 2)
  totalSteps: number; // e.g., 7
  eyebrow?: string;
  isSaving?: boolean;
}

export function ProgressBar({
  currentStepIndex,
  totalSteps,
  eyebrow,
  isSaving = false,
}: ProgressBarProps) {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((currentStepIndex / totalSteps) * 100))
  );

  return (
    <div className="w-full mb-6 select-none" role="region" aria-label="Onboarding Progress">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] mb-2">
        <span className="font-outfit uppercase tracking-[0.2em] text-[10px] sm:text-[11px] font-bold text-[var(--primary-sage)]">
          {eyebrow || `STEP ${currentStepIndex} OF ${totalSteps}`}
        </span>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="font-figtree text-[10px] text-[var(--primary-sage)] font-medium animate-pulse">
              Saving...
            </span>
          )}
          <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">
            {percentage}%
          </span>
        </div>
      </div>

      <div
        className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--border-hairline)]"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Step ${currentStepIndex} of ${totalSteps}, ${percentage}% complete`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out motion-reduce:transition-none ${
            isSaving
              ? "bg-[var(--primary-sage)] animate-zen-shimmer shadow-xs"
              : "bg-[var(--primary-sage)]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
