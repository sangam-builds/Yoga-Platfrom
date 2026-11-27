"use client";

import React, { useState } from "react";
import { Check, Edit2, Target } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ui/ProgressRing";

interface WeeklyGoalRingProps {
  completed?: number;
  initialTarget?: number;
  practiceDays?: boolean[]; // 7 days Mon-Sun
  className?: string;
}

export function WeeklyGoalRing({
  completed = 0,
  initialTarget = 3,
  practiceDays = [false, false, false, false, false, false, false],
  className = "",
}: WeeklyGoalRingProps) {
  const [target, setTarget] = useState(initialTarget);
  const [isEditing, setIsEditing] = useState(false);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const percentage = Math.min(Math.round((completed / target) * 100), 100);

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            WEEKLY PRACTICE GOAL
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="font-figtree text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary-sage)] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditing ? "Done" : "Edit Goal"}</span>
          </button>
        </div>

        {/* Ring & Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 my-2">
          <ProgressRing
            value={completed}
            max={target}
            size={100}
            strokeWidth={9}
            color="var(--primary-sage)"
            centerLabel={`${completed}/${target}`}
            centerSubtext="classes"
            ariaLabel={`${completed} of ${target} weekly goal completed`}
          />

          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-outfit font-semibold text-lg text-[var(--text-primary)]">
              {percentage >= 100
                ? "Weekly Goal Accomplished!"
                : `${target - completed} more session to reach your target`}
            </h4>
            <p className="font-figtree text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              Practicing {target} times a week builds sustained neuro-muscular adaptation and mindful resilience.
            </p>

            {/* Goal Target Stepper when editing */}
            {isEditing && (
              <div className="mt-3 inline-flex items-center gap-3 p-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <span className="text-xs font-medium text-[var(--text-muted)] px-1">Goal:</span>
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTarget(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      target === num
                        ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Habit Strip (Mon-Sun) */}
      <div className="pt-4 mt-4 border-t border-[var(--border-hairline)]">
        <p className="font-figtree text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
          This Week&apos;s Rhythm
        </p>
        <div className="grid grid-cols-7 gap-2 text-center">
          {dayLabels.map((day, idx) => {
            const isPracticed = practiceDays[idx];
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-[var(--text-subtle)]">{day}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-2xs ${
                    isPracticed
                      ? "bg-[var(--primary-sage)] text-[var(--on-primary)] font-bold"
                      : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-subtle)]"
                  }`}
                >
                  {isPracticed ? <Check className="w-4 h-4 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-hairline)]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
