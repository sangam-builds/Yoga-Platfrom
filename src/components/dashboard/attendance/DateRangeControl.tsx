"use client";

import React from "react";
import { Download, FileText, ChevronDown } from "lucide-react";
import { DateRangePreset } from "@/lib/hooks/dashboard/useAttendanceData";

interface DateRangeControlProps {
  currentPreset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  onExportCsv: () => void;
  className?: string;
}

export function DateRangeControl({
  currentPreset,
  onPresetChange,
  onExportCsv,
  className = "",
}: DateRangeControlProps) {
  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "3m", label: "3 Months" },
    { id: "year", label: "Year" },
  ];

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-hairline)] select-none ${className}`}>
      <div>
        <p className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase mb-1">
          YOUR PROGRESS
        </p>
        <h1 className="font-outfit text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight">
          Attendance
        </h1>
        <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          Verified studio check-ins, practice consistency heatmap, and mindful habit analytics.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {/* Segmented Preset Switcher */}
        <div className="p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center gap-1 shadow-2xs">
          {presets.map((p) => {
            const active = currentPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPresetChange(p.id)}
                className={`px-3 py-1.5 rounded-lg font-figtree text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-figtree text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>Export Logs</span>
        </button>
      </div>
    </div>
  );
}
