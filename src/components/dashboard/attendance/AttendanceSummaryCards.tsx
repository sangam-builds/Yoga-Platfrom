"use client";

import React from "react";
import { CheckCircle2, Flame, Clock, Percent } from "lucide-react";
import { StatCard } from "@/components/dashboard/ui/StatCard";
import { AttendanceSummary } from "@/lib/hooks/dashboard/useAttendanceData";

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
  className?: string;
}

export function AttendanceSummaryCards({
  summary,
  className = "",
}: AttendanceSummaryCardsProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 ${className}`}>
      {/* 1. Classes Attended */}
      <StatCard
        label="Classes Attended"
        value={summary.classesAttended}
        unit="sessions"
        icon={<CheckCircle2 className="w-5 h-5 text-[var(--primary-sage)]" />}
        deltaText={summary.classesAttendedDelta}
        deltaPositive={true}
        sparklineData={[14, 16, 18, 20, 21, 24]}
        sparklineColor="var(--primary-sage)"
        subtext="100% verified attendance"
      />

      {/* 2. Attendance Rate */}
      <StatCard
        label="Attendance Rate"
        value={summary.attendanceRate}
        unit="%"
        icon={<Percent className="w-5 h-5 text-[var(--info-teal)]" />}
        deltaText={summary.attendanceRateDelta}
        deltaPositive={true}
        sparklineData={[91, 92, 94, 93, 95, 95.8]}
        sparklineColor="var(--info-teal)"
        subtext="Completed vs booked"
      />

      {/* 3. Current Streak */}
      <StatCard
        label="Current Streak"
        value={summary.currentStreakDays}
        unit="days"
        icon={<Flame className="w-5 h-5 text-[var(--accent-amber)]" />}
        sparklineData={[2, 3, 4, 4, 5, 6]}
        sparklineColor="var(--accent-amber)"
        subtext={`Personal record: ${summary.bestStreakDays} days`}
      />

      {/* 4. Total Mat Minutes */}
      <StatCard
        label="Total Practice Time"
        value={summary.totalHours}
        unit=""
        icon={<Clock className="w-5 h-5 text-[var(--chart-lavender)]" />}
        deltaText={summary.totalHoursDelta}
        deltaPositive={true}
        sparklineData={[10, 12, 14, 15, 17, 18.5]}
        sparklineColor="var(--chart-lavender)"
        subtext={`${summary.totalMatMinutes} total minutes`}
      />
    </div>
  );
}
