"use client";

import React from "react";
import Link from "next/link";
import { Award, Flame, Sun, Sparkles, ArrowRight, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";

export function RecentAchievementsCard({ className = "" }: { className?: string }) {
  const { formatDate } = useI18n();

  const { data: badgesData } = useQuery({
    queryKey: ["user-badges"],
    queryFn: async () => {
      const res = await fetch("/api/me/badges");
      if (!res.ok) throw new Error("Failed to load badges");
      return res.json();
    },
  });

  const earned = badgesData?.earned || [];
  const locked = badgesData?.locked || [];

  // Compose up to 3 badges: earned first, then locked in-progress
  const displayBadges = [
    ...earned.map((b: any) => ({
      id: b.id,
      name: b.name,
      earnedAt: b.earnedAt ? formatDate(b.earnedAt) : "Recently",
      icon: b.key?.includes("streak") ? Flame : b.key?.includes("early") ? Sun : Sparkles,
      color: "var(--primary-sage)",
      earned: true,
      description: b.description,
      current: b.target || 1,
      target: b.target || 1,
      progress: 100,
    })),
    ...locked.map((b: any) => ({
      id: b.id,
      name: b.name,
      earnedAt: null,
      icon: b.key?.includes("streak") ? Flame : b.key?.includes("early") ? Sun : Sparkles,
      color: "var(--accent-amber)",
      earned: false,
      description: b.description,
      current: b.current ?? 0,
      target: b.target ?? 1,
      progress: b.progress ?? 0,
    })),
  ].slice(0, 3);

  // Fallback if badges not yet configured in DB
  const fallbackBadges = [
    {
      id: "fb-1",
      name: "First Breath",
      earnedAt: null,
      icon: Sparkles,
      color: "var(--primary-sage)",
      earned: false,
      description: "Complete your first live yoga session",
      current: 0,
      target: 1,
      progress: 0,
    },
    {
      id: "fb-2",
      name: "Week Warrior",
      earnedAt: null,
      icon: Flame,
      color: "var(--accent-amber)",
      earned: false,
      description: "Practice 7 consecutive days",
      current: 0,
      target: 7,
      progress: 0,
    },
    {
      id: "fb-3",
      name: "Dedicated Yogi",
      earnedAt: null,
      icon: Award,
      color: "var(--chart-lavender)",
      earned: false,
      description: "Complete 10 total yoga sessions",
      current: 0,
      target: 10,
      progress: 0,
    },
  ];

  const badges = displayBadges.length > 0 ? displayBadges : fallbackBadges;

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
                    : "border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20 opacity-85"
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
                      <span>
                        {b.current}/{b.target} classes
                      </span>
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
