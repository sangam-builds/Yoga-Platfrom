"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// ─── 1. PageHeader ──────────────────────────────────────────────────────────
export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, description, badge, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D1DBCF] dark:border-[#283E31]">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#6C7B72] dark:text-[#A4B5A9] mb-1 font-figtree">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {b.href ? (
                  <Link href={b.href} className="hover:text-[#29352F] dark:hover:text-white transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[#29352F] dark:text-gray-200 font-medium">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-[#9AA69F]" />}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold tracking-tight text-[#29352F] dark:text-white">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-outfit uppercase tracking-wider bg-[#E1EDDD] text-[#35523E] border border-[#C6DAC9]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="font-figtree text-sm text-[#6C7B72] dark:text-[#A4B5A9] max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── 2. StatCard ────────────────────────────────────────────────────────────
export interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  subtext?: string;
  icon?: React.ReactNode;
  href?: string;
  isPositive?: boolean;
}

export function StatCard({ label, value, change, subtext, icon, href, isPositive = true }: StatCardProps) {
  const content = (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] shadow-xs hover:border-[#47664A] dark:hover:border-[#47664A] transition-all group">
      <div className="flex items-center justify-between text-[#6C7B72] dark:text-[#A4B5A9] mb-3">
        <span className="font-outfit text-[11px] font-bold uppercase tracking-[0.2em] text-[#607B6A]">{label}</span>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-[#E1EDDD] text-[#35523E] flex items-center justify-center group-hover:bg-[#47664A] group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-outfit text-3xl sm:text-4xl font-bold text-[#29352F] dark:text-white">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full font-figtree border ${
              isPositive
                ? "bg-[#EDF5EE] text-[#2D5A37] border-[#CDE5D1]"
                : "bg-[#FBF1F0] text-[#A63A36] border-[#F0D5D3]"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="font-figtree text-xs text-[#6C7B72] dark:text-[#A4B5A9] mt-2">{subtext}</p>}
    </div>
  );

  return href ? (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[#47664A] rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
}

// ─── 3. StatusBadge ─────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  let color = "bg-[#FAF6EE] text-[#5C6B63] border border-[#D1DBCF]";

  if (["ACTIVE", "BOOKED", "ATTENDED", "SUCCEEDED", "OPEN", "LIVE_NOW"].includes(normalized)) {
    color = "bg-[#E1EDDD] text-[#2C4A3E] border border-[#C6DAC9]";
  } else if (["TRIALING", "WAITLISTED", "PENDING", "FEW_SPOTS"].includes(normalized)) {
    color = "bg-[#FAF2E6] text-[#8C6228] border border-[#EDD8B6]";
  } else if (["PAST_DUE", "FAILED", "MISSED", "CANCELLED", "FULL"].includes(normalized)) {
    color = "bg-[#FBF1F0] text-[#A63A36] border border-[#F0D5D3]";
  } else if (["PAUSED", "COMPLETED"].includes(normalized)) {
    color = "bg-[#E8EFF5] text-[#2E5875] border border-[#CFDFEC]";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-figtree tracking-wide ${color}`}>
      {status}
    </span>
  );
}

// ─── 4. EmptyState ──────────────────────────────────────────────────────────
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white dark:bg-[#18261E] border border-dashed border-[#D1DBCF] dark:border-[#283E31] space-y-4">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#E1EDDD] text-[#35523E] flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-outfit text-lg font-semibold text-[#29352F] dark:text-white">{title}</h3>
        <p className="font-figtree text-sm text-[#6C7B72] dark:text-[#A4B5A9] leading-relaxed">{description}</p>
      </div>
      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-[#47664A] hover:bg-[#3B563E] active:bg-[#324935] text-white transition-all shadow-xs"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="bg-[#47664A] hover:bg-[#3B563E] active:bg-[#324935] text-white rounded-xl text-sm font-medium px-4 py-2.5 transition-all shadow-xs cursor-pointer"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 5. ErrorState ──────────────────────────────────────────────────────────
export function ErrorState({
  message = "Failed to load information",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-[#FBF1F0] border border-[#F0D5D3] space-y-3">
      <AlertCircle className="w-8 h-8 text-[#C2413C]" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#A63A36]">{message}</p>
        <p className="text-xs text-[#A63A36]/80 font-figtree">Please check your connection and try again.</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3.5 py-1.5 text-[#A63A36] border border-[#F0D5D3] hover:bg-[#F7E5E3] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

// ─── 6. ProgressBar ─────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
}: {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className="space-y-1.5 w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-[#6C7B72] dark:text-[#A4B5A9] font-figtree">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-semibold font-outfit text-[#29352F] dark:text-white">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="w-full h-2.5 bg-[#E5DFD4] dark:bg-[#203428] rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-[#47664A] transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ─── 7. Countdown ───────────────────────────────────────────────────────────
export function Countdown({ targetDate, onZero }: { targetDate: Date | string; onZero?: () => void }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateDiff(targetDate));

  React.useEffect(() => {
    const timer = setInterval(() => {
      const diff = calculateDiff(targetDate);
      setTimeLeft(diff);
      if (diff.total <= 0) {
        clearInterval(timer);
        onZero?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onZero]);

  function calculateDiff(dateStr: Date | string) {
    const total = new Date(dateStr).getTime() - Date.now();
    const seconds = Math.max(0, Math.floor((total / 1000) % 60));
    const minutes = Math.max(0, Math.floor((total / 1000 / 60) % 60));
    const hours = Math.max(0, Math.floor((total / (1000 * 60 * 60)) % 24));
    const days = Math.max(0, Math.floor(total / (1000 * 60 * 60 * 24)));
    return { total, days, hours, minutes, seconds };
  }

  if (timeLeft.total <= 0) {
    return <span className="text-xs font-bold text-[#47664A] font-outfit">Starting Now</span>;
  }

  return (
    <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8]">
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>{String(timeLeft.hours).padStart(2, "0")}h</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
    </div>
  );
}

// ─── 8. CopyButton ──────────────────────────────────────────────────────────
export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-[#D1DBCF] bg-[#FAF6EE] hover:bg-[#F3EFE5] text-[#29352F] transition-colors cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#47664A]" />
          <span className="text-[#47664A] font-semibold">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-[#637063]" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── 9. Skeletons ───────────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] animate-pulse space-y-3">
      <div className="h-3 w-20 bg-[#E5DFD4] dark:bg-[#203428] rounded-sm" />
      <div className="h-8 w-16 bg-[#D1DBCF] dark:bg-[#283E31] rounded-sm" />
      <div className="h-3 w-28 bg-[#FAF6EE] dark:bg-[#1A2A21] rounded-sm" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] animate-pulse space-y-3">
      <div className="h-6 w-1/4 bg-[#E5DFD4] dark:bg-[#203428] rounded-sm" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 w-1/3 bg-[#E5DFD4] dark:bg-[#203428] rounded-sm" />
          <div className="h-4 w-1/4 bg-[#FAF6EE] dark:bg-[#1A2A21] rounded-sm" />
          <div className="h-4 w-1/6 bg-[#FAF6EE] dark:bg-[#1A2A21] rounded-sm" />
        </div>
      ))}
    </div>
  );
}
