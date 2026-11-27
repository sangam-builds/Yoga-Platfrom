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
  const hasHistory = summary.classesAttended > 0;

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
        subtext={hasHistory ? "Verified mat sessions" : "Book your first class to begin"}
      />

      {/* 2. Attendance Rate */}
      <StatCard
        label="Attendance Rate"
        value={summary.attendanceRate}
        unit="%"
        icon={<Percent className="w-5 h-5 text-[var(--info-teal)]" />}
        deltaText={summary.attendanceRateDelta}
        deltaPositive={true}
        subtext={hasHistory ? "Completed vs booked" : "No bookings yet"}
      />

      {/* 3. Current Streak */}
      <StatCard
        label="Current Streak"
        value={summary.currentStreakDays}
        unit="days"
        icon={<Flame className="w-5 h-5 text-[var(--accent-amber)]" />}
        subtext={
          summary.currentStreakDays > 0
            ? `Personal record: ${summary.bestStreakDays} days`
            : "Practice today to start your streak"
        }
      />

      {/* 4. Total Mat Minutes */}
      <StatCard
        label="Total Practice Time"
        value={summary.totalHours}
        unit=""
        icon={<Clock className="w-5 h-5 text-[var(--chart-lavender)]" />}
        deltaText={summary.totalHoursDelta}
        deltaPositive={true}
        subtext={`${summary.totalMatMinutes} total minutes`}
      />
    </div>
  );
}
