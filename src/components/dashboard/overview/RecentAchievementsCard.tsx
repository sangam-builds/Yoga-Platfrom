"use client";

import React from "react";
import Link from "next/link";
import { Award, Flame, Sun, Sparkles, ArrowRight, Lock } from "lucide-react";

export function RecentAchievementsCard({ className = "" }: { className?: string }) {
  const badges = [
    {
      id: "b-1",
      name: "7-Day Warrior",
      earnedAt: "Oct 28, 2026",
      icon: Flame,
      color: "var(--accent-amber)",
      earned: true,
      description: "Completed 7 days of consecutive practice",
    },
    {
      id: "b-2",
      name: "Sunrise Practitioner",
      earnedAt: "Nov 02, 2026",
      icon: Sun,
      color: "var(--primary-sage)",
      earned: true,
      description: "Attended 5 morning flows before 8am",
    },
    {
      id: "b-3",
      name: "Style Explorer",
      earnedAt: null,
      icon: Sparkles,
      color: "var(--chart-lavender)",
      earned: false,
      description: "Practice 4 different yoga styles (3/4)",
    },
  ];

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            RECENT BADGES & MILESTONES
          </span>
          <Link
            href="/dashboard/certificates"
            className="font-figtree text-xs font-semibold text-[var(--primary-sage)] hover:underline inline-flex items-center gap-1 group"
          >
            <span>All badges</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
          {badges.map((b) => {
            const Icon = b.icon;

            return (
              <div
                key={b.id}
                className={`p-3.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  b.earned
                    ? "border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50"
                    : "border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 opacity-75"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-2xs"
                  style={{
                    backgroundColor: b.earned ? "var(--sage-tint)" : "var(--bg-elevated)",
                    color: b.earned ? b.color : "var(--text-subtle)",
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h5 className="font-outfit font-semibold text-xs text-[var(--text-primary)] truncate max-w-full">
                  {b.name}
                </h5>
                <p className="font-figtree text-[10px] text-[var(--text-muted)] line-clamp-2 mt-0.5">
                  {b.description}
                </p>

                <div className="mt-2 pt-2 border-t border-[var(--border-hairline)] w-full">
                  {b.earned ? (
                    <span className="text-[10px] font-semibold text-[var(--primary-sage)]">
                      Earned {b.earnedAt}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[var(--text-subtle)] flex items-center justify-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>In Progress</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
