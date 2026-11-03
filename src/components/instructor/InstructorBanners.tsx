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
    <div className="space-y-3">
      {/* Missing Payout Details Banner */}
      {!hasPayoutDetails && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-amber-950">
                Payout destination not configured
              </p>
              <p className="text-amber-700">
                Add your bank account or UPI ID to receive monthly automated revenue share payouts.
              </p>
            </div>
          </div>
          <Link
            href="/instructor/earnings"
            className="shrink-0 inline-flex items-center gap-1.5 font-bold text-amber-800 hover:text-amber-950 underline"
          >
            Add Payout Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* MFA Not Enabled Banner */}
      {!hasMfa && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <p className="font-semibold text-rose-950">
                Mandatory Two-Factor Authentication (MFA) Required
              </p>
              <p className="text-rose-700">
                Secure your teacher account with an authenticator app (TOTP) to protect student and payout data.
              </p>
            </div>
          </div>
          <Link
            href="/instructor/settings"
            className="shrink-0 inline-flex items-center gap-1.5 font-bold text-rose-800 hover:text-rose-950 underline"
          >
            Enable MFA <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Pending Attendance Dispute Banner */}
      {pendingDisputesCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="font-semibold text-blue-950">
                {pendingDisputesCount} Attendance Dispute{pendingDisputesCount > 1 ? "s" : ""} Awaiting Response
              </p>
              <p className="text-blue-700">
                Students submitted evidence for missed or late attendance marks. Review within 7 days.
              </p>
            </div>
          </div>
          <Link
            href="/instructor/attendance"
            className="shrink-0 inline-flex items-center gap-1.5 font-bold text-blue-800 hover:text-blue-950 underline"
          >
            Review Disputes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
