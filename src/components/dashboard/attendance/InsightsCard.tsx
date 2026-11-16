"use client";

import React, { useMemo } from "react";
import { Sparkles, Sun, Flame, Heart, TrendingUp } from "lucide-react";
import type {
  AttendanceSummary,
  StyleDistribution,
  TimeOfDayDistribution,
} from "@/lib/hooks/dashboard/useAttendanceData";

interface InsightsCardProps {
  summary: AttendanceSummary;
  styles?: StyleDistribution[];
  timeOfDay?: TimeOfDayDistribution[];
}

export function InsightsCard({ summary, styles, timeOfDay }: InsightsCardProps) {
  // Generate friendly dynamic insights based on data
  const insights = useMemo(() => {
    const list: Array<{
      id: string;
      icon: React.ElementType;
      title: string;
      description: string;
      highlight: string;
    }> = [];

    // 1. Time of Day insight
    if (timeOfDay && timeOfDay.length > 0) {
      const topTime = [...timeOfDay].sort((a, b) => b.classes - a.classes)[0];
      if (topTime && topTime.classes > 0) {
        const slotClean = topTime.timeSlot.split("(")[0].trim().toLowerCase();
        list.push({
          id: "time-of-day",
          icon: Sun,
          title: "Prime Practice Rhythm",
          description: `You are most devoted during ${slotClean} hours, accounting for ${topTime.percentage}% of all your sessions.`,
          highlight: `${topTime.percentage}% in ${slotClean}`,
        });
      }
    }

    // 2. Favorite Style insight
    if (styles && styles.length > 0) {
      const topStyle = [...styles].sort((a, b) => b.count - a.count)[0];
      if (topStyle && topStyle.count > 0) {
        list.push({
          id: "fav-style",
          icon: Heart,
          title: "Favorite Sanctuary",
          description: `${topStyle.style} is your signature practice with ${topStyle.count} sessions completed (${topStyle.percentage}% of your journey).`,
          highlight: topStyle.style,
        });
      }
    }

    // 3. Streak & Consistency insight
    if (summary.bestStreakDays > 0) {
      const isRecord = summary.currentStreakDays >= summary.bestStreakDays;
      list.push({
        id: "streak-momentum",
        icon: Flame,
        title: isRecord ? "Peak Momentum!" : "Streak Milestones",
        description: isRecord
          ? `You're currently matching your all-time record of ${summary.currentStreakDays} days in a row! Mat presence is unmatched.`
          : `Your longest unbroken practice streak reached ${summary.bestStreakDays} consecutive days. Current run: ${summary.currentStreakDays} days.`,
        highlight: `${summary.bestStreakDays} day record`,
      });
    }

    // Fallback if needed
    if (list.length < 2) {
      list.push({
        id: "rate-consistency",
        icon: TrendingUp,
        title: "High Dedication",
        description: `You've achieved an outstanding ${summary.attendanceRate}% attendance rate across all scheduled mat reservations.`,
        highlight: `${summary.attendanceRate}% rate`,
      });
    }

    return list.slice(0, 3);
  }, [summary, styles, timeOfDay]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[20px] p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary-sage)]">
            SMART OBSERVATIONS
          </span>
          <h3 className="font-outfit text-lg font-semibold text-[var(--text-primary)]">
            Habits & Consistency
          </h3>
        </div>
        <div className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Insights List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/60 hover:bg-[var(--bg-elevated)] transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-primary)] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--text-muted)]">Key Pattern</span>
                <span className="text-xs font-semibold text-[var(--primary-sage)]">
                  {item.highlight}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
