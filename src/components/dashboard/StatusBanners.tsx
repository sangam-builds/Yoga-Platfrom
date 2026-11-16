"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, CreditCard, Clock, X, ArrowRight } from "lucide-react";

export interface StatusBannerData {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
  dismissible: boolean;
}

export function StatusBanners({
  emailVerified,
  trialEndsInDays,
  paymentFailed,
  isPaused,
  creditsRemaining,
}: {
  emailVerified?: boolean;
  trialEndsInDays?: number | null;
  paymentFailed?: boolean;
  isPaused?: boolean;
  creditsRemaining?: number | null;
}) {
  const [dismissed, setDismissed] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zenflow_dismissed_banners");
      if (stored) {
        setDismissed(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = (id: string) => {
    const updated = { ...dismissed, [id]: Date.now() };
    setDismissed(updated);
    try {
      localStorage.setItem("zenflow_dismissed_banners", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const isStillDismissed = (id: string) => {
    const ts = dismissed[id];
    if (!ts) return false;
    const hours = (Date.now() - ts) / (1000 * 60 * 60);
    return hours < 24; // Dismissed for 24 hours
  };

  const banners: StatusBannerData[] = [];

  // 1. Payment failed (Critical, cannot dismiss)
  if (paymentFailed) {
    banners.push({
      id: "payment_failed",
      type: "critical",
      title: "Your last membership payment failed. Please update your payment method to maintain class access.",
      actionLabel: "Update Payment",
      actionHref: "/dashboard/membership#billing",
      dismissible: false,
    });
  }

  // 2. Email not verified (Warning)
  if (emailVerified === false && !isStillDismissed("email_unverified")) {
    banners.push({
      id: "email_unverified",
      type: "warning",
      title: "Your email address is not yet verified. Please verify to ensure you receive booking confirmations.",
      actionLabel: "Verify Email",
      actionHref: "/dashboard/settings#security",
      dismissible: true,
    });
  }

  // 3. Subscription paused
  if (isPaused) {
    banners.push({
      id: "sub_paused",
      type: "info",
      title: "Your yoga subscription is currently paused. Resume anytime to book live sessions.",
      actionLabel: "Resume Membership",
      actionHref: "/dashboard/membership",
      dismissible: false,
    });
  }

  // 4. Trial ending in <= 3 days
  if (
    trialEndsInDays !== null &&
    trialEndsInDays !== undefined &&
    trialEndsInDays <= 3 &&
    trialEndsInDays >= 0 &&
    !isStillDismissed("trial_ending")
  ) {
    banners.push({
      id: "trial_ending",
      type: "warning",
      title: `Your free trial ends in ${trialEndsInDays === 0 ? "today" : `${trialEndsInDays} day(s)`}. Choose a plan to continue your practice.`,
      actionLabel: "Choose Plan",
      actionHref: "/dashboard/membership#plans",
      dismissible: true,
    });
  }

  // 5. Credits below 2
  if (
    creditsRemaining !== null &&
    creditsRemaining !== undefined &&
    creditsRemaining < 2 &&
    creditsRemaining >= 0 &&
    !isStillDismissed("low_credits")
  ) {
    banners.push({
      id: "low_credits",
      type: "info",
      title: `You have ${creditsRemaining} class credit${creditsRemaining === 1 ? "" : "s"} left. Top up credits for uninterrupted practice.`,
      actionLabel: "Buy Credits",
      actionHref: "/dashboard/membership#credits",
      dismissible: true,
    });
  }

  if (banners.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {banners.map((b) => (
        <div
          key={b.id}
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium border ${
            b.type === "critical"
              ? "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200"
              : b.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200"
              : "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {b.type === "critical" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            ) : b.type === "warning" ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            ) : (
              <Clock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            )}
            <span className="truncate">{b.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {b.actionHref && (
              <Link
                href={b.actionHref}
                className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                <span>{b.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {b.dismissible && (
              <button
                type="button"
                onClick={() => handleDismiss(b.id)}
                className="opacity-60 hover:opacity-100 p-0.5 ml-1"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

