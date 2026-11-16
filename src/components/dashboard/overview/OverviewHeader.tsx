"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface OverviewHeaderProps {
  name?: string;
  streakDays?: number;
}

export function OverviewHeader({ name = "Yogi", streakDays = 0 }: OverviewHeaderProps) {
  const { formatDate } = useI18n();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const firstName = name.split(" ")[0];

  const motivationalQuote =
    streakDays > 5
      ? `You're on a ${streakDays}-day streak! Keep up the mindful momentum.`
      : streakDays > 0
      ? `A ${streakDays}-day practice streak. Consistency is your foundation.`
      : "Step onto your mat today and honor your journey.";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-hairline)] select-none">
      <div>
        <p className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase mb-1">
          {formatDate(new Date())}
        </p>
        <h1 className="font-outfit text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--text-primary)] tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="font-figtree text-sm text-[var(--text-muted)] mt-1 max-w-xl">
          {motivationalQuote}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/schedule"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] font-figtree font-medium text-sm transition-all duration-200 shadow-xs cursor-pointer group"
        >
          <Calendar className="w-4 h-4" />
          <span>Browse schedule</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
