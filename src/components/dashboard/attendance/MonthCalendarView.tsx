"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { AttendanceRecord } from "@/lib/hooks/dashboard/useAttendanceData";

interface MonthCalendarViewProps {
  records: AttendanceRecord[];
  onSelectDate?: (dateStr: string) => void;
  selectedDate?: string | null;
}

export function MonthCalendarView({
  records,
  onSelectDate,
  selectedDate,
}: MonthCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = useMemo(() => {
    return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  }, [currentDate]);

  // Map records by YYYY-MM-DD
  const dateMap = useMemo(() => {
    const map = new Map<string, { status: "ATTENDED" | "MISSED" | "LATE"; title: string }>();
    records.forEach((r) => {
      const d = r.date.slice(0, 10);
      map.set(d, {
        status: r.status === "MISSED" ? "MISSED" : "ATTENDED",
        title: r.classTitle,
      });
    });
    return map;
  }, [records]);

  // Compute calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startingDay = firstDay.getDay() - 1;
    if (startingDay === -1) startingDay = 6;

    const totalDays = lastDay.getDate();
    const days: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      status?: "ATTENDED" | "MISSED" | "LATE";
      title?: string;
      isToday: boolean;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().slice(0, 10);
    for (let i = 1; i <= totalDays; i++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const rec = dateMap.get(dStr);
      days.push({
        dayNum: i,
        dateStr: dStr,
        isCurrentMonth: true,
        status: rec?.status,
        title: rec?.title,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month, dateMap]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[20px] p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary-sage)]">
            MONTHLY CALENDAR
          </span>
          <h3 className="font-outfit text-lg font-semibold text-[var(--text-primary)]">
            {monthName}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToday}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-semibold text-[var(--text-muted)]">
        {weekHeaders.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((d, idx) => {
          const isSelected = selectedDate === d.dateStr;
          return (
            <button
              key={`${d.dateStr}-${idx}`}
              type="button"
              disabled={!d.isCurrentMonth}
              onClick={() => d.isCurrentMonth && onSelectDate?.(d.dateStr)}
              className={`relative h-10 sm:h-12 flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all ${
                !d.isCurrentMonth
                  ? "opacity-25 cursor-default text-[var(--text-muted)]"
                  : isSelected
                  ? "bg-[var(--sage-tint)] text-[var(--primary-sage)] ring-2 ring-[var(--primary-sage)] font-semibold shadow-xs"
                  : "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              } ${d.isToday && !isSelected ? "ring-1.5 ring-[var(--primary-sage)] font-semibold" : ""}`}
              title={d.title ? `${d.dateStr}: ${d.title} (${d.status})` : d.dateStr}
            >
              <span>{d.dayNum}</span>
              {/* Status indicator dot */}
              {d.status && d.isCurrentMonth && (
                <span
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    d.status === "MISSED"
                      ? "bg-[var(--negative-rose)]"
                      : "bg-[var(--primary-sage)]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 mt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--primary-sage)]" />
          <span>Attended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--negative-rose)]" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md border border-[var(--primary-sage)]" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
