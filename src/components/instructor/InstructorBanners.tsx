"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  X,
} from "lucide-react";

interface InstructorBannersProps {
  hasMfa?: boolean;
  hasPayoutDetails?: boolean;
  pendingDisputesCount?: number;
}

export function InstructorBanners({
  hasMfa = true,
  hasPayoutDetails = true,
  pendingDisputesCount = 0,
}: InstructorBannersProps) {
  // If all good, don't show any banners
  if (hasMfa && hasPayoutDetails && pendingDisputesCount === 0) {
    return null;
  }

  return (
    <div className="space-y-3 font-figtree select-none">
      {/* Missing Payout Details Banner */}
      {!hasPayoutDetails && (
        <div className="bg-[var(--accent-amber-tint)] border border-[var(--accent-amber)]/30 text-[var(--accent-amber)] px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] font-outfit">
                Payout destination not configured
              </p>
              <p className="text-[var(--text-muted)] mt-0.5">
                Add your bank account or UPI ID to receive monthly automated revenue share payouts.
              </p>
            </div>
          </div>
          <Link
            href="/instructor/earnings"
            className="shrink-0 inline-flex items-center gap-1.5 font-bold text-[var(--accent-amber)] hover:underline"
          >
            Add Payout Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* MFA Not Enabled Banner */}
      {!hasMfa && (
        <div className="bg-[var(--negative-rose-tint)] border border-[var(--negative-rose)]/20 text-[var(--negative-rose)] px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--negative-rose)]/20 text-[var(--negative-rose)] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] font-outfit">
                Mandatory Two-Factor Authentication (MFA) Required
              </p>
              <p className="text-[var(--text-muted)] mt-0.5">
                Secure your teacher account with an authenticator app (TOTP) to protect student and payout data.
              </p>
            </div>
          </div>
          <Link
            href="/instructor/settings"
            className="shrink-0 inline-flex items-center gap-1.5 font-bold text-[var(--negative-rose)] hover:underline"
          >
            Enable MFA <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Pending Attendance Dispute Banner */}
      {pendingDisputesCount > 0 && (
        <div className="bg-[var(--info-teal-tint)] border border-[var(--info-teal)]/20 text-[var(--info-teal)] px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--info-teal)]/20 text-[var(--info-teal)] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[var(--text-primary)] font-outfit">
                {pendingDisputesCount} Attendance Dispute{pendingDisputesCount > 1 ? "s" : ""} Awaiting Response
              </p>
              <p className="text-[var(--text-muted)] mt-0.5">
                Students submitted evidence for missed or late attendance marks. Review within 7 days.
              </p>
            </div>
          </div>
          <Link
            href="/instructor/attendance"
            className="shrink-0 inline-flex items-center gap-1.5 font-bold text-[var(--info-teal)] hover:underline"
          >
            Review Disputes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

