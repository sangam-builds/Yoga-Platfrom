"use client";

import React, { useEffect } from "react";
import { Globe, Clock } from "lucide-react";
import { OptionCard } from "../OptionCard";

interface StepLocaleProps {
  timezone?: string;
  locale?: "en" | "hi" | "pa";
  onChange: (data: { timezone: string; locale: "en" | "hi" | "pa" }) => void;
}

const LANGUAGES = [
  { id: "en", label: "English", description: "Default platform language" },
  { id: "hi", label: "हिन्दी (Hindi)", description: "सभी सत्र और निर्देश हिन्दी में" },
  { id: "pa", label: "ਪੰਜਾਬੀ (Punjabi)", description: "ਸਾਰੇ ਕਲਾਸ ਨਿਰਦੇਸ਼ ਪੰਜਾਬੀ ਵਿੱਚ" },
];

const COMMON_TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Australia/Sydney",
];

export function StepLocale({
  timezone = "Asia/Kolkata",
  locale = "en",
  onChange,
}: StepLocaleProps) {
  // Auto-detect browser timezone on mount if not set
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected && detected !== timezone && timezone === "Asia/Kolkata") {
        onChange({ timezone: detected, locale });
      }
    } catch {
      // Keep default
    }
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    onChange({
      timezone,
      locale: newLocale as "en" | "hi" | "pa",
    });
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      timezone: e.target.value,
      locale,
    });
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-3">
          <Globe className="w-4 h-4 text-[var(--primary-sage)]" />
          Preferred Language
        </label>
        <fieldset className="space-y-2.5" role="radiogroup" aria-label="Select Language">
          <legend className="sr-only">Choose language</legend>
          {LANGUAGES.map((lang) => (
            <OptionCard
              key={lang.id}
              id={lang.id}
              label={lang.label}
              description={lang.description}
              selected={locale === lang.id}
              isMultiSelect={false}
              onSelect={handleLanguageChange}
            />
          ))}
        </fieldset>
      </div>

      {/* Timezone Selector */}
      <div className="pt-2">
        <label
          htmlFor="timezone-select"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2"
        >
          <Clock className="w-4 h-4 text-[var(--primary-sage)]" />
          Class Schedule Timezone
        </label>
        <div className="relative">
          <select
            id="timezone-select"
            value={timezone}
            onChange={handleTimezoneChange}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5 text-sm text-[var(--text-primary)] focus:border-[var(--primary-sage)] focus:ring-2 focus:ring-[var(--primary-sage)]/20 outline-none cursor-pointer transition-all"
          >
            {/* If detected timezone is not in common list, render it on top */}
            {!COMMON_TIMEZONES.includes(timezone) && (
              <option value={timezone}>{timezone} (Detected)</option>
            )}
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          Live class schedules and reminders will adjust automatically to this timezone.
        </p>
      </div>
    </div>
  );
}
