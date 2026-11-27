"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ui/ProgressRing";
import { useAttendanceHeatmap, useAttendanceSummary } from "@/lib/hooks/dashboard/useAttendanceData";

export function AttendanceSummaryCard({ className = "" }: { className?: string }) {
  const { heatmapDays } = useAttendanceHeatmap();
  const { summary } = useAttendanceSummary();

  const completed = summary.weeklyGoalCompleted;
  const target = summary.weeklyGoalTarget || 3;
  const remaining = Math.max(0, target - completed);

  // Pick last 12 weeks = 84 days
  const miniDays = heatmapDays.slice(-84);

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            PRACTICE CONSISTENCY
          </span>
          <Link
            href="/dashboard/attendance"
            className="font-figtree text-xs font-semibold text-[var(--primary-sage)] hover:underline inline-flex items-center gap-1 group"
          >
            <span>Full tracker</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Weekly Goal Progress Ring & Metrics */}
        <div className="flex items-center gap-5 my-2">
          <ProgressRing
            value={completed}
            max={target}
            size={72}
            strokeWidth={7}
            color="var(--primary-sage)"
            centerLabel={`${completed}/${target}`}
            centerSubtext="this wk"
            ariaLabel={`${completed} of ${target} weekly classes completed`}
          />

          <div>
            <h4 className="font-outfit font-semibold text-base sm:text-lg text-[var(--text-primary)]">
              Weekly Habit Target
            </h4>
            <p className="font-figtree text-xs text-[var(--text-muted)] mt-0.5">
              {completed >= target
                ? `Commitment achieved! You've reached your ${target}-class goal for this week.`
                : completed > 0
                ? `${remaining} more session${remaining === 1 ? "" : "s"} needed to hit your ${target}-class weekly goal.`
                : `${target} classes planned this week to build mindful consistency.`}
            </p>
          </div>
        </div>

        {/* 12-Week Mini Heatmap Matrix */}
        <div className="pt-4 mt-4 border-t border-[var(--border-hairline)]">
          <p className="font-figtree text-xs font-medium text-[var(--text-muted)] mb-2.5">
            Past 12 Weeks Activity
          </p>
          <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1 max-w-full">
            {miniDays.map((day, idx) => {
              const bg =
                day.level === 4
                  ? "bg-[var(--primary-sage)]"
                  : day.level === 3
                  ? "bg-[var(--primary-sage)]/80"
                  : day.level === 2
                  ? "bg-[var(--primary-sage)]/50"
                  : day.level === 1
                  ? "bg-[var(--primary-sage)]/25"
                  : "bg-[var(--border-hairline)]/50";

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} classes (${day.minutes}m)`}
                  className={`w-3.5 h-3.5 rounded-xs ${bg} transition-colors hover:ring-1 hover:ring-[var(--primary-sage)] cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
