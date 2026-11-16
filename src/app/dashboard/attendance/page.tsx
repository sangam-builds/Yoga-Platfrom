"use client";

import React, { useState, useCallback } from "react";
import { DateRangeControl } from "@/components/dashboard/attendance/DateRangeControl";
import { AttendanceSummaryCards } from "@/components/dashboard/attendance/AttendanceSummaryCards";
import { WeeklyGoalRing } from "@/components/dashboard/attendance/WeeklyGoalRing";
import { ActivityHeatmap } from "@/components/dashboard/attendance/ActivityHeatmap";
import { AttendanceCharts } from "@/components/dashboard/attendance/AttendanceCharts";
import { MonthCalendarView } from "@/components/dashboard/attendance/MonthCalendarView";
import { InsightsCard } from "@/components/dashboard/attendance/InsightsCard";
import { AttendanceTable } from "@/components/dashboard/attendance/AttendanceTable";
import { ErrorState } from "@/components/dashboard/ui/ErrorState";
import { CardSkeleton } from "@/components/dashboard/ui/Skeletons";
import { useToast } from "@/components/dashboard/shared/Toast";
import {
  useAttendanceSummary,
  useAttendanceHeatmap,
  useAttendanceSeries,
  useAttendanceLogs,
  type DateRangePreset,
  type AttendanceRecord,
} from "@/lib/hooks/dashboard/useAttendanceData";

export default function AttendancePage() {
  const { toast } = useToast();
  const [range, setRange] = useState<DateRangePreset>("30d");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Data fetching hooks
  const {
    summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAttendanceSummary(range);

  const {
    heatmapDays,
    isLoading: heatmapLoading,
    error: heatmapError,
    refetch: refetchHeatmap,
  } = useAttendanceHeatmap();

  const {
    weeklyMinutes,
    monthlyClasses,
    styleDistribution,
    timeOfDay,
    isLoading: seriesLoading,
  } = useAttendanceSeries(range);

  const {
    records: logs,
    isLoading: logsLoading,
  } = useAttendanceLogs();

  const handleExportCsv = useCallback(() => {
    if (!logs || logs.length === 0) {
      toast.info("No records", "No attendance records available to export.");
      return;
    }

    const headers = ["Date", "Class", "Instructor", "Style", "Minutes", "Status"];
    const rows = logs.map((l: AttendanceRecord) => [
      l.date,
      `"${l.classTitle.replace(/"/g, '""')}"`,
      `"${l.instructorName.replace(/"/g, '""')}"`,
      l.style,
      l.minutes,
      l.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r: (string | number)[]) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `zenflow_attendance_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV Exported", "Your attendance records have been downloaded.");
  }, [logs, toast]);

  const handleRetryAll = () => {
    refetchSummary?.();
    refetchHeatmap?.();
  };

  const hasGlobalError = summaryError || heatmapError;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header with Controls */}
      <DateRangeControl
        currentPreset={range}
        onPresetChange={setRange}
        onExportCsv={handleExportCsv}
      />

      {hasGlobalError && (
        <ErrorState
          title="Could not load complete attendance records"
          message="A network or service disruption occurred while loading data."
          onRetry={handleRetryAll}
        />
      )}

      {/* 1. Summary Cards */}
      {summaryLoading || !summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <AttendanceSummaryCards summary={summary} />
      )}

      {/* 2. Top Analytics Row: Weekly Goal + Full Year Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          {summaryLoading || !summary ? (
            <CardSkeleton className="h-full min-h-[340px]" />
          ) : (
            <WeeklyGoalRing
              completed={summary.weeklyGoalCompleted}
              initialTarget={summary.weeklyGoalTarget}
              practiceDays={summary.weeklyPracticeDays}
            />
          )}
        </div>

        <div className="lg:col-span-8 flex flex-col">
          {heatmapLoading || !heatmapDays ? (
            <CardSkeleton className="h-full min-h-[340px]" />
          ) : (
            <ActivityHeatmap
              days={heatmapDays}
              selectedDate={selectedDateFilter}
              onSelectDate={(date: string | null) => setSelectedDateFilter(date)}
            />
          )}
        </div>
      </div>

      {/* 3. Deep Dive Charts: Minutes Area, Monthly Classes, Style Donut, Time of Day */}
      {seriesLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CardSkeleton className="h-72" />
          <CardSkeleton className="h-72" />
        </div>
      ) : (
        <AttendanceCharts
          weeklyMinutes={weeklyMinutes}
          monthlyClasses={monthlyClasses}
          styles={styleDistribution}
          timeOfDay={timeOfDay}
        />
      )}

      {/* 4. Month Calendar & Dynamic Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <MonthCalendarView
            records={logs || []}
            selectedDate={selectedDateFilter}
            onSelectDate={(date) =>
              setSelectedDateFilter((prev) => (prev === date ? null : date))
            }
          />
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {summary && (
            <InsightsCard
              summary={summary}
              styles={styleDistribution}
              timeOfDay={timeOfDay}
            />
          )}
        </div>
      </div>

      {/* 5. Detailed Attendance Table with Dispute Action */}
      <AttendanceTable
        records={logs || []}
        isLoading={logsLoading}
        selectedDate={selectedDateFilter}
        onClearDateFilter={() => setSelectedDateFilter(null)}
      />
    </div>
  );
}
