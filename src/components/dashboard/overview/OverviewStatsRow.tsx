"use client";

import React from "react";
import { Flame, CheckCircle2, Clock, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/ui/StatCard";

interface OverviewStatsRowProps {
  stats?: {
    streakDays?: number;
    totalClasses?: number;
    totalHours?: number;
    classesThisMonth?: number;
    classesDelta?: number;
  } | null;
  className?: string;
}

export function OverviewStatsRow({ stats, className = "" }: OverviewStatsRowProps) {
  const streak = stats?.streakDays ?? 6;
  const totalClasses = stats?.totalClasses ?? 24;
  const totalHours = stats?.totalHours ?? 18.5;
  const classesThisMonth = stats?.classesThisMonth ?? 8;
  const delta = stats?.classesDelta ?? 2;

  const deltaText = delta !== 0 ? `${delta > 0 ? "+" : ""}${delta} vs last month` : null;

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 ${className}`}>
      {/* 1. Practice Streak */}
      <StatCard
        label="Current Streak"
        value={streak}
        unit="days"
        icon={<Flame className="w-5 h-5 text-[var(--accent-amber)]" />}
        sparklineData={[2, 3, 4, 3, 5, 5, 6]}
        sparklineColor="var(--accent-amber)"
        subtext="Personal best: 14 days"
      />

      {/* 2. Total Sessions */}
      <StatCard
        label="Total Completed"
        value={totalClasses}
        unit="classes"
        icon={<CheckCircle2 className="w-5 h-5 text-[var(--primary-sage)]" />}
        sparklineData={[12, 14, 16, 18, 20, 22, 24]}
        sparklineColor="var(--primary-sage)"
        subtext="Lifetime mat sessions"
      />

      {/* 3. Hours Practiced */}
      <StatCard
        label="Hours Practiced"
        value={totalHours}
        unit="hrs"
        icon={<Clock className="w-5 h-5 text-[var(--info-teal)]" />}
        sparklineData={[8, 10, 11, 14, 15, 17, 18.5]}
        sparklineColor="var(--info-teal)"
        subtext="Dedicated mindful time"
      />

      {/* 4. Monthly Classes */}
      <StatCard
        label="Classes This Month"
        value={classesThisMonth}
        unit="sessions"
        icon={<Calendar className="w-5 h-5 text-[var(--primary-sage)]" />}
        deltaText={deltaText}
        deltaPositive={delta >= 0}
        subtext="Pacing toward 10 classes"
      />
    </div>
  );
}
