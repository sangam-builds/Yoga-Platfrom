"use client";

import React from "react";
import { Flame, CheckCircle2, Clock, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/ui/StatCard";

interface OverviewStatsRowProps {
  stats?: {
    currentStreak?: number;
    longestStreak?: number;
    streakDays?: number;
    totalClasses?: number;
    totalHours?: number;
    classesThisMonth?: number;
    classesDelta?: number;
    weeklyGoalTarget?: number;
    weeklyGoalCompleted?: number;
  } | null;
  className?: string;
}

export function OverviewStatsRow({ stats, className = "" }: OverviewStatsRowProps) {
  const streak = stats?.currentStreak ?? stats?.streakDays ?? 0;
  const longest = stats?.longestStreak ?? 0;
  const totalClasses = stats?.totalClasses ?? 0;
  const totalHours = stats?.totalHours ?? 0;
  const classesThisMonth = stats?.classesThisMonth ?? 0;
  const delta = stats?.classesDelta ?? 0;
  const weeklyTarget = stats?.weeklyGoalTarget ?? 3;

  const deltaText =
    delta !== 0 && totalClasses > 0
      ? `${delta > 0 ? "+" : ""}${delta} vs last month`
      : null;

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 ${className}`}>
      {/* 1. Practice Streak */}
      <StatCard
        label="Current Streak"
        value={streak}
        unit="days"
        icon={<Flame className="w-5 h-5 text-[var(--accent-amber)]" />}
        subtext={
          streak > 0
            ? `Personal best: ${longest} days`
            : "Practice today to start your streak"
        }
      />

      {/* 2. Total Sessions */}
      <StatCard
        label="Total Completed"
        value={totalClasses}
        unit="classes"
        icon={<CheckCircle2 className="w-5 h-5 text-[var(--primary-sage)]" />}
        subtext={
          totalClasses > 0
            ? "Lifetime mindful sessions"
            : "Book your first class to begin"
        }
      />

      {/* 3. Hours Practiced */}
      <StatCard
        label="Hours Practiced"
        value={totalHours}
        unit="hrs"
        icon={<Clock className="w-5 h-5 text-[var(--info-teal)]" />}
        subtext={
          totalHours > 0
            ? "Dedicated mindful time"
            : "Time spent on the mat"
        }
      />

      {/* 4. Monthly Classes */}
      <StatCard
        label="Classes This Month"
        value={classesThisMonth}
        unit="sessions"
        icon={<Calendar className="w-5 h-5 text-[var(--primary-sage)]" />}
        deltaText={deltaText}
        deltaPositive={delta >= 0}
        subtext={`Weekly target: ${weeklyTarget} classes`}
      />
    </div>
  );
}
