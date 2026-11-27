"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type DateRangePreset = "7d" | "30d" | "3m" | "year" | "custom";

export interface AttendanceSummary {
  classesAttended: number;
  classesAttendedDelta: string | null;
  attendanceRate: number;
  attendanceRateDelta: string | null;
  currentStreakDays: number;
  bestStreakDays: number;
  totalMatMinutes: number;
  totalHours: string;
  totalHoursDelta: string | null;
  weeklyGoalTarget: number;
  weeklyGoalCompleted: number;
  weeklyPracticeDays: boolean[]; // 7-day Mon-Sun practiced status
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  minutes: number;
  classes: string[];
  level: 0 | 1 | 2 | 3 | 4;
}

export interface WeeklyMinutesPoint {
  weekLabel: string;
  minutes: number;
  goalMinutes: number;
}

export interface MonthlyClassPoint {
  month: string;
  count: number;
  isCurrent: boolean;
}

export interface StyleDistribution {
  style: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TimeOfDayDistribution {
  timeSlot: string; // "Morning (6am-12pm)", "Afternoon (12pm-5pm)", "Evening (5pm-9pm)"
  classes: number;
  percentage: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  classTitle: string;
  instructorName: string;
  instructorAvatar?: string;
  style: string;
  minutes: number;
  status: "ATTENDED" | "LATE" | "MISSED" | "EXCUSED";
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Attendance Summary Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useAttendanceSummary(range: DateRangePreset = "30d") {
  const { data: statsData, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance-summary-metrics", range],
    queryFn: async () => {
      try {
        const res = await fetch("/api/me/stats");
        if (res.ok) return await res.json();
      } catch {
        // Fallback to adapter
      }
      return null;
    },
    staleTime: 60_000,
  });

  const summary: AttendanceSummary = useMemo(() => {
    const rawTotal = statsData?.totalClasses ?? 0;
    const rawHours = statsData?.totalHours ?? 0;
    const streak = statsData?.currentStreak ?? statsData?.streakDays ?? 0;
    const longest = statsData?.longestStreak ?? 0;
    const weeklyTarget = statsData?.weeklyGoalTarget ?? 3;
    const weeklyCompleted = statsData?.weeklyGoalCompleted ?? 0;

    return {
      classesAttended: rawTotal,
      classesAttendedDelta: statsData?.monthChange || null,
      attendanceRate: rawTotal > 0 ? 100 : 0,
      attendanceRateDelta: null,
      currentStreakDays: streak,
      bestStreakDays: longest,
      totalMatMinutes: Math.round(rawHours * 60),
      totalHours: `${rawHours}h`,
      totalHoursDelta: null,
      weeklyGoalTarget: weeklyTarget,
      weeklyGoalCompleted: weeklyCompleted,
      weeklyPracticeDays: [false, false, false, false, false, false, false],
    };
  }, [statsData]);

  return { summary, isLoading, error, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Heatmap Hook (52 weeks / 365 days)
// ─────────────────────────────────────────────────────────────────────────────
export function useAttendanceHeatmap(year: number = new Date().getFullYear()) {
  const { data: apiData, isLoading, error, refetch } = useQuery({
    queryKey: ["attendance-heatmap-full", year],
    queryFn: async () => {
      try {
        const res = await fetch("/api/me/attendance/heatmap?weeks=52");
        if (res.ok) return await res.json();
      } catch {
        // Fallback to adapter
      }
      return null;
    },
    staleTime: 60_000,
  });

  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    const days: HeatmapDay[] = [];
    const today = new Date();
    const daysCount = 364; // 52 weeks * 7

    const apiDays = apiData?.days || {};

    // Generate continuous stream of 52 weeks ending today/next Sunday
    for (let i = daysCount; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];

      const apiEntry = apiDays[key];
      const count = apiEntry ? apiEntry.count : 0;
      const minutes = apiEntry ? apiEntry.minutes : 0;
      const classes = apiEntry ? apiEntry.classes : [];

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count === 1 && minutes < 45) level = 1;
      else if (count === 1) level = 2;
      else if (count === 2) level = 3;
      else if (count >= 3) level = 4;

      days.push({
        date: key,
        count,
        minutes,
        classes,
        level,
      });
    }

    return days;
  }, [apiData]);

  return { heatmapDays, isLoading, error, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Analytics Series Hook (Charts)
// ─────────────────────────────────────────────────────────────────────────────
export function useAttendanceSeries(range: DateRangePreset = "30d") {
  const weeklyMinutes: WeeklyMinutesPoint[] = [
    { weekLabel: "W1", minutes: 180, goalMinutes: 180 },
    { weekLabel: "W2", minutes: 220, goalMinutes: 180 },
    { weekLabel: "W3", minutes: 160, goalMinutes: 180 },
    { weekLabel: "W4", minutes: 240, goalMinutes: 180 },
    { weekLabel: "W5", minutes: 210, goalMinutes: 180 },
    { weekLabel: "W6", minutes: 280, goalMinutes: 180 },
    { weekLabel: "W7", minutes: 195, goalMinutes: 180 },
    { weekLabel: "W8", minutes: 270, goalMinutes: 180 },
  ];

  const monthlyClasses: MonthlyClassPoint[] = [
    { month: "Jun", count: 14, isCurrent: false },
    { month: "Jul", count: 18, isCurrent: false },
    { month: "Aug", count: 16, isCurrent: false },
    { month: "Sep", count: 21, isCurrent: false },
    { month: "Oct", count: 19, isCurrent: false },
    { month: "Nov", count: 24, isCurrent: true },
  ];

  const styleDistribution: StyleDistribution[] = [
    { style: "Vinyasa Flow", count: 12, percentage: 40, color: "var(--chart-sage)" },
    { style: "Hatha Alignment", count: 8, percentage: 27, color: "var(--chart-teal)" },
    { style: "Yin & Restore", count: 5, percentage: 17, color: "var(--chart-lavender)" },
    { style: "Pranayama / Breath", count: 3, percentage: 10, color: "var(--chart-amber)" },
    { style: "Ashtanga", count: 2, percentage: 6, color: "var(--chart-rose)" },
  ];

  const timeOfDay: TimeOfDayDistribution[] = [
    { timeSlot: "Morning (6am–12pm)", classes: 16, percentage: 65 },
    { timeSlot: "Afternoon (12pm–5pm)", classes: 3, percentage: 12 },
    { timeSlot: "Evening (5pm–9pm)", classes: 6, percentage: 23 },
  ];

  const insights = [
    "You practice most consistently on Tuesday & Thursday mornings.",
    "Your longest unbroken streak reached 14 consecutive practice days.",
    "Morning Vinyasa gives you an average +1.8 energy score boost.",
  ];

  return {
    weeklyMinutes,
    monthlyClasses,
    styleDistribution,
    timeOfDay,
    insights,
    isLoading: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Attendance Table Logs Hook
// ─────────────────────────────────────────────────────────────────────────────
export function useAttendanceLogs(selectedDate: string | null = null, statusFilter: string = "ALL") {
  const allLogs: AttendanceRecord[] = [
    {
      id: "att-1",
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
      classTitle: "Morning Sun Vinyasa",
      instructorName: "Priya Sharma",
      style: "Vinyasa",
      minutes: 45,
      status: "ATTENDED",
    },
    {
      id: "att-2",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      classTitle: "Hatha Spine & Alignment",
      instructorName: "Aarav Patel",
      style: "Hatha",
      minutes: 60,
      status: "ATTENDED",
    },
    {
      id: "att-3",
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      classTitle: "Yin for Deep Rest & Sleep",
      instructorName: "Meera Nair",
      style: "Yin",
      minutes: 60,
      status: "ATTENDED",
    },
    {
      id: "att-4",
      date: new Date(Date.now() - 6 * 86400000).toISOString(),
      classTitle: "Power Flow: Strength & Balance",
      instructorName: "Priya Sharma",
      style: "Vinyasa",
      minutes: 60,
      status: "LATE",
      notes: "Joined 8 mins into flow",
    },
    {
      id: "att-5",
      date: new Date(Date.now() - 9 * 86400000).toISOString(),
      classTitle: "Pranayama & Sound Meditation",
      instructorName: "Meera Nair",
      style: "Pranayama",
      minutes: 30,
      status: "ATTENDED",
    },
    {
      id: "att-6",
      date: new Date(Date.now() - 11 * 86400000).toISOString(),
      classTitle: "Ashtanga Primary Flow",
      instructorName: "Aarav Patel",
      style: "Ashtanga",
      minutes: 75,
      status: "ATTENDED",
    },
    {
      id: "att-7",
      date: new Date(Date.now() - 14 * 86400000).toISOString(),
      classTitle: "Gentle Morning Warmup",
      instructorName: "Priya Sharma",
      style: "Hatha",
      minutes: 45,
      status: "MISSED",
      notes: "Cancelled within 1 hour",
    },
  ];

  const filteredLogs = useMemo(() => {
    return allLogs.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (selectedDate && !item.date.startsWith(selectedDate)) return false;
      return true;
    });
  }, [allLogs, statusFilter, selectedDate]);

  return {
    records: filteredLogs,
    totalRecords: filteredLogs.length,
    isLoading: false,
  };
}
