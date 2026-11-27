"use client";

import React from "react";
import { ONBOARDING_STEPS } from "@/modules/onboarding/onboarding.config";
import { OptionCard } from "../OptionCard";

interface StepScheduleProps {
  times?: string[];
  days?: number[];
  onChange: (data: { times: string[]; days: number[] }) => void;
}

const WEEKDAYS = [
  { id: 1, label: "Mon", full: "Monday" },
  { id: 2, label: "Tue", full: "Tuesday" },
  { id: 3, label: "Wed", full: "Wednesday" },
  { id: 4, label: "Thu", full: "Thursday" },
  { id: 5, label: "Fri", full: "Friday" },
  { id: 6, label: "Sat", full: "Saturday" },
  { id: 0, label: "Sun", full: "Sunday" },
];

export function StepSchedule({
  times = [],
  days = [],
  onChange,
}: StepScheduleProps) {
  const timeOptions = ONBOARDING_STEPS.schedule.options || [];

  const handleTimeToggle = (id: string) => {
    const nextTimes = times.includes(id)
      ? times.filter((t) => t !== id)
      : [...times, id];
    onChange({ times: nextTimes, days });
  };

  const handleDayToggle = (dayId: number) => {
    const nextDays = days.includes(dayId)
      ? days.filter((d) => d !== dayId)
      : [...days, dayId];
    onChange({ times, days: nextDays });
  };

  return (
    <div className="space-y-6">
      {/* Time of Day */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
          Preferred Times of Day
        </label>
        <fieldset className="grid grid-cols-1 gap-2.5" aria-label="Preferred Practice Times">
          <legend className="sr-only">Times of day</legend>
          {timeOptions.map((opt) => (
            <OptionCard
              key={opt.id}
              id={opt.id}
              label={opt.label}
              description={opt.description}
              iconName={opt.icon}
              selected={times.includes(opt.id)}
              isMultiSelect={true}
              onSelect={handleTimeToggle}
            />
          ))}
        </fieldset>
      </div>

      {/* Days of Week */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
          Preferred Days of the Week
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" role="group" aria-label="Practice Days">
          {WEEKDAYS.map((day) => {
            const isSelected = days.includes(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => handleDayToggle(day.id)}
                aria-pressed={isSelected}
                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                  isSelected
                    ? "bg-[var(--primary-sage)] text-[var(--on-primary)] border-[var(--primary-sage)] shadow-xs"
                    : "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)]`}
              >
                <span>{day.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
