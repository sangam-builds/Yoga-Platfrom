"use client";

import React from "react";
import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";

interface NextCertificateCardProps {
  className?: string;
}

export function NextCertificateCard({ className = "" }: NextCertificateCardProps) {
  const completed = 26;
  const target = 30;
  const remaining = target - completed;
  const percentage = Math.round((completed / target) * 100);

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all select-none ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            CERTIFICATION MILESTONE
          </span>
          <span className="font-figtree text-xs font-semibold text-[var(--primary-sage)]">
            {percentage}% Complete
          </span>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-outfit font-semibold text-base sm:text-lg text-[var(--text-primary)]">
              Level 1 Foundation Mastery
            </h4>
            <p className="font-figtree text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
              Complete <strong className="text-[var(--text-primary)]">{remaining} more sessions</strong> to earn your verified credential and digital certificate.
            </p>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="space-y-1.5 my-3">
          <div className="h-2 w-full bg-[var(--border-hairline)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary-sage)] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-figtree text-[var(--text-muted)]">
            <span>{completed} classes completed</span>
            <span>Goal: {target} classes</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[var(--border-hairline)]">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center justify-between w-full font-figtree text-xs font-semibold text-[var(--primary-sage)] hover:underline group"
        >
          <span>View certificate requirements</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
