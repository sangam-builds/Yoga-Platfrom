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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {b.href ? (
                  <Link href={b.href} className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-gray-400" />}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E9E2D0] text-[#233D32] dark:bg-[#233D32] dark:text-[#E9E2D0]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>
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
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 shadow-xs hover:border-[#6B8F71] dark:hover:border-[#6B8F71] transition-all group">
      <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center group-hover:bg-[#6B8F71]/15 group-hover:text-[#233D32] dark:group-hover:text-[#A7C4B5] transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtext}</p>}
    </div>
  );

  return href ? (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[#6B8F71] rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
}

// ─── 3. StatusBadge ─────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  let color = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  if (["ACTIVE", "BOOKED", "ATTENDED", "SUCCEEDED", "OPEN"].includes(normalized)) {
    color = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";
  } else if (["TRIALING", "WAITLISTED", "PENDING", "FEW_SPOTS"].includes(normalized)) {
    color = "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300";
  } else if (["PAST_DUE", "FAILED", "MISSED", "CANCELLED", "FULL"].includes(normalized)) {
    color = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300";
  } else if (["PAUSED", "COMPLETED"].includes(normalized)) {
    color = "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${color}`}>
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
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-800 space-y-4">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {icon}
        </div>
      )}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-[#233D32] hover:bg-[#6B8F71] text-white transition-colors shadow-xs"
            >
              {action.label}
            </Link>
          ) : (
            <Button
              type="button"
              onClick={action.onClick}
              className="bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-xl text-sm font-semibold px-4 py-2"
            >
              {action.label}
            </Button>
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
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-3">
      <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-rose-900 dark:text-rose-200">{message}</p>
        <p className="text-xs text-rose-700/80 dark:text-rose-400">Please check your connection and try again.</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3.5 py-1.5 text-rose-800 border-rose-300 dark:border-rose-800 hover:bg-rose-100"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </Button>
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
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-semibold">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-[#6B8F71] transition-all duration-500 rounded-full"
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
    return <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Starting Now</span>;
  }

  return (
    <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
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
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-600 font-semibold">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-gray-500" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── 9. Skeletons ───────────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse space-y-3">
      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded-sm" />
      <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded-sm" />
      <div className="h-3 w-28 bg-gray-100 dark:bg-gray-800 rounded-sm" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse space-y-3">
      <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-sm" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-sm" />
          <div className="h-4 w-1/4 bg-gray-100 dark:bg-gray-800 rounded-sm" />
          <div className="h-4 w-1/6 bg-gray-100 dark:bg-gray-800 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

