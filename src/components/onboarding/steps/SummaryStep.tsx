"use client";

import React from "react";
import { CheckCircle2, Gift, Sparkles, MessageCircle, Mail } from "lucide-react";

interface SummaryStepProps {
  answers: {
    experienceLevel?: string | null;
    goals?: string[];
    preferredStyles?: string[];
    preferredTimes?: string[];
    preferredDays?: number[];
    weeklyGoal?: number | null;
    timezone?: string;
    locale?: string;
    marketingOptIn?: boolean;
    whatsappOptIn?: boolean;
  };
  onConsentChange: (consent: { marketingOptIn: boolean; whatsappOptIn: boolean }) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function SummaryStep({ answers, onConsentChange }: SummaryStepProps) {
  const marketingOptIn = Boolean(answers.marketingOptIn);
  const whatsappOptIn = Boolean(answers.whatsappOptIn);

  return (
    <div className="space-y-6">
      {/* 7-Day Free Trial Perk Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--sage-tint)] border border-[var(--primary-sage)]/30 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary-sage)] text-[var(--on-primary)] flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-outfit text-base font-semibold text-[var(--text-primary)]">
            7-Day Free Trial Included
          </h2>
          <p className="font-figtree text-xs sm:text-[13px] text-[var(--text-muted)] mt-1 leading-relaxed">
            You will receive <strong>5 free class credits</strong> immediately upon completing your practice profile. No credit card required.
          </p>
        </div>
      </div>

      {/* Profile Review Highlights */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
          <span className="text-[var(--text-muted)]">Experience Level</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {answers.experienceLevel || "Beginner"}
          </span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
          <span className="text-[var(--text-muted)]">Weekly Goal</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {answers.weeklyGoal || 3} classes / week
          </span>
        </div>

        {answers.goals && answers.goals.length > 0 && (
          <div className="flex items-start justify-between pb-3 border-b border-[var(--border-hairline)]">
            <span className="text-[var(--text-muted)] shrink-0 mr-4">Primary Goals</span>
            <span className="font-semibold text-[var(--text-primary)] text-right capitalize">
              {answers.goals.map((g) => g.replace(/_/g, " ")).join(", ")}
            </span>
          </div>
        )}

        {answers.preferredStyles && answers.preferredStyles.length > 0 && (
          <div className="flex items-start justify-between pb-3 border-b border-[var(--border-hairline)]">
            <span className="text-[var(--text-muted)] shrink-0 mr-4">Styles</span>
            <span className="font-semibold text-[var(--text-primary)] text-right">
              {answers.preferredStyles.join(", ")}
            </span>
          </div>
        )}

        {answers.preferredDays && answers.preferredDays.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Preferred Days</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {answers.preferredDays.map((d) => DAY_NAMES[d]).join(", ")}
            </span>
          </div>
        )}
      </div>

      {/* Optional Marketing & Communication Opt-Ins (Default OFF) */}
      <div className="pt-2 space-y-3 border-t border-[var(--border-hairline)]">
        <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--text-muted)] select-none">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) =>
              onConsentChange({
                marketingOptIn,
                whatsappOptIn: e.target.checked,
              })
            }
            className="mt-0.5 w-4 h-4 rounded text-[var(--primary-sage)] focus:ring-[var(--primary-sage)] border-[var(--border-subtle)] bg-[var(--bg-surface)] cursor-pointer"
          />
          <div>
            <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
              WhatsApp practice reminders & class schedule alerts
            </span>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Receive gentle 15-minute reminders before your booked live sessions. You can turn this off anytime.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--text-muted)] select-none">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) =>
              onConsentChange({
                marketingOptIn: e.target.checked,
                whatsappOptIn,
              })
            }
            className="mt-0.5 w-4 h-4 rounded text-[var(--primary-sage)] focus:ring-[var(--primary-sage)] border-[var(--border-subtle)] bg-[var(--bg-surface)] cursor-pointer"
          />
          <div>
            <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
              Mindful weekly digest & wellness community news
            </span>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Occasional curated playlists, seasonal routines, and studio announcements.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
