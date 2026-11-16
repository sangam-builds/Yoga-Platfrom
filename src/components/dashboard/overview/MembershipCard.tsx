"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, Plus, ArrowRight } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/ui/ProgressRing";
import { Pill } from "@/components/dashboard/ui/Pill";
import { useI18n } from "@/lib/i18n";

interface MembershipCardProps {
  subscription?: {
    status?: string;
    plan?: {
      name?: string;
      credits?: number;
      priceInr?: number;
    };
    creditsRemaining?: number;
    currentPeriodEnd?: string;
  } | null;
  className?: string;
}

export function MembershipCard({ subscription, className = "" }: MembershipCardProps) {
  const { formatDate } = useI18n();

  const planName = subscription?.plan?.name || "Self-Practice Pass";
  const status = (subscription?.status || "ACTIVE").toLowerCase();
  const isUnlimited = subscription?.creditsRemaining === null || subscription?.plan?.credits === null;
  const creditsRemaining = subscription?.creditsRemaining ?? (isUnlimited ? 999 : 4);
  const maxCredits = subscription?.plan?.credits || (isUnlimited ? 999 : 10);
  const renewalDate = subscription?.currentPeriodEnd
    ? formatDate(subscription.currentPeriodEnd)
    : "Dec 15, 2026";

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
    >
      <div>
        {/* Top Eyebrow & Status */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            MEMBERSHIP & CREDITS
          </span>
          <Pill variant={status}>{status.replace("_", " ").toUpperCase()}</Pill>
        </div>

        {/* Main Content: Ring + Plan Info */}
        <div className="flex items-center gap-5 my-3">
          <ProgressRing
            value={isUnlimited ? 100 : creditsRemaining}
            max={isUnlimited ? 100 : maxCredits}
            size={76}
            strokeWidth={7}
            color="var(--primary-sage)"
            centerLabel={isUnlimited ? "∞" : creditsRemaining}
            centerSubtext={isUnlimited ? "all access" : "left"}
            ariaLabel={isUnlimited ? "Unlimited session credits" : `${creditsRemaining} credits remaining of ${maxCredits}`}
          />

          <div className="min-w-0">
            <h4 className="font-outfit font-semibold text-lg sm:text-xl text-[var(--text-primary)] truncate">
              {planName}
            </h4>
            <p className="font-figtree text-xs text-[var(--text-muted)] mt-0.5">
              Renews on <span className="font-medium text-[var(--text-primary)]">{renewalDate}</span>
            </p>
            <p className="font-figtree text-[11px] text-[var(--text-subtle)] mt-1">
              {isUnlimited ? "Unlimited live classes included" : `${creditsRemaining} of ${maxCredits} session credits remaining`}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-4 border-t border-[var(--border-hairline)]">
        <Link
          href="/dashboard/membership"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-canvas)] text-[var(--text-primary)] font-figtree font-medium text-xs transition-colors cursor-pointer"
        >
          <span>Manage plan</span>
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </Link>

        <Link
          href="/dashboard/membership#credit-packs"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--sage-tint)] hover:bg-[var(--sage-tint)]/80 text-[var(--sage-tint-icon)] font-figtree font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buy credits</span>
        </Link>
      </div>
    </div>
  );
}
