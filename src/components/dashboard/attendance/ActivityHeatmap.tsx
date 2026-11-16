"use client";

import React, { useState, useMemo } from "react";
import { HeatmapDay } from "@/lib/hooks/dashboard/useAttendanceData";

interface ActivityHeatmapProps {
  days: HeatmapDay[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  className?: string;
}

export function ActivityHeatmap({
  days,
  selectedDate,
  onSelectDate,
  className = "",
}: ActivityHeatmapProps) {
  const [activeTooltip, setActiveTooltip] = useState<HeatmapDay | null>(null);

  // Group 364 days into 52 columns of 7 days (rows 0=Sun to 6=Sat)
  const columns = useMemo(() => {
    const cols: HeatmapDay[][] = [];
    let current: HeatmapDay[] = [];

    days.forEach((day, i) => {
      current.push(day);
      if (current.length === 7 || i === days.length - 1) {
        cols.push(current);
        current = [];
      }
    });

    return cols;
  }, [days]);

  // Compute month labels aligned with columns
  const monthLabels = useMemo(() => {
    const labels: { index: number; name: string }[] = [];
    let lastMonth = -1;

    columns.forEach((col, idx) => {
      if (col[0]) {
        const date = new Date(col[0].date);
        const m = date.getMonth();
        if (m !== lastMonth) {
          const name = date.toLocaleString("default", { month: "short" });
          labels.push({ index: idx, name });
          lastMonth = m;
        }
      }
    });

    return labels;
  }, [columns]);

  const levelColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-[var(--primary-sage)]";
      case 3:
        return "bg-[var(--primary-sage)]/80";
      case 2:
        return "bg-[var(--primary-sage)]/50";
      case 1:
        return "bg-[var(--primary-sage)]/25";
      default:
        return "bg-[var(--bg-elevated)] border border-[var(--border-hairline)]/60";
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            365-DAY ACTIVITY HEATMAP
          </span>
          <h3 className="font-outfit font-semibold text-lg text-[var(--text-primary)]">
            Practice Frequency Matrix
          </h3>
          <p className="font-figtree text-xs text-[var(--text-muted)] mt-0.5">
            Click any active day square to filter the verified practice log table below.
          </p>
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="text-xs font-semibold text-[var(--primary-sage)] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Clear day filter ({selectedDate})
          </button>
        )}
      </div>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto pb-3">
        <div className="min-w-[680px]">
          {/* Top Month Labels */}
          <div className="flex text-[10px] font-figtree font-medium text-[var(--text-subtle)] mb-2 pl-7">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                style={{
                  position: "relative",
                  left: `${m.index * 12.8}px`,
                  marginRight: i === monthLabels.length - 1 ? 0 : "auto",
                }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Grid Area with Left Weekday Labels */}
          <div className="flex items-start gap-2">
            {/* Left Weekday Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between h-[96px] text-[10px] font-figtree font-medium text-[var(--text-subtle)] pr-1 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Matrix of Columns */}
            <div
              role="grid"
              aria-label="Annual Attendance Heatmap"
              className="flex items-center gap-[3px]"
            >
              {columns.map((col, colIdx) => (
                <div key={colIdx} role="row" className="flex flex-col gap-[3px]">
                  {col.map((day) => {
                    const isSelected = selectedDate === day.date;
                    const isToday = day.date === new Date().toISOString().split("T")[0];

                    return (
                      <button
                        key={day.date}
                        role="gridcell"
                        type="button"
                        onClick={() => onSelectDate(isSelected ? null : day.date)}
                        onMouseEnter={() => setActiveTooltip(day)}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onFocus={() => setActiveTooltip(day)}
                        onBlur={() => setActiveTooltip(null)}
                        aria-label={`${day.date}: ${day.count} sessions, ${day.minutes} minutes`}
                        aria-selected={isSelected}
                        className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer relative ${levelColor(
                          day.level
                        )} ${
                          isSelected
                            ? "ring-2 ring-[var(--text-primary)] scale-110 z-10"
                            : isToday
                            ? "ring-1.5 ring-[var(--accent-amber)]"
                            : "hover:ring-1.5 hover:ring-[var(--primary-sage)]"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Live Tooltip Output & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-hairline)] text-xs font-figtree">
        {/* Active Tooltip Info */}
        <div className="min-h-[20px]">
          {activeTooltip ? (
            <p className="text-[var(--text-primary)] font-medium">
              <strong className="font-semibold text-[var(--primary-sage)]">
                {activeTooltip.date}
              </strong>
              :{" "}
              {activeTooltip.count > 0 ? (
                <>
                  <span>
                    {activeTooltip.count} {activeTooltip.count === 1 ? "class" : "classes"} (
                    {activeTooltip.minutes}m)
                  </span>{" "}
                  &middot;{" "}
                  <span className="text-[var(--text-muted)]">
                    {activeTooltip.classes.join(", ")}
                  </span>
                </>
              ) : (
                <span className="text-[var(--text-muted)]">Rest day (no session recorded)</span>
              )}
            </p>
          ) : (
            <span className="text-[var(--text-subtle)] text-[11px]">
              Hover or focus a square to view practice details.
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] shrink-0 self-end sm:self-auto">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[2px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)]" />
          <span className="w-3 h-3 rounded-[2px] bg-[var(--primary-sage)]/25" />
          <span className="w-3 h-3 rounded-[2px] bg-[var(--primary-sage)]/50" />
          <span className="w-3 h-3 rounded-[2px] bg-[var(--primary-sage)]/80" />
          <span className="w-3 h-3 rounded-[2px] bg-[var(--primary-sage)]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
