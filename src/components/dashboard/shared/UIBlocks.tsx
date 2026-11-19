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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-hairline)] select-none">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1 font-figtree">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {b.href ? (
                  <Link href={b.href} className="hover:text-[var(--text-primary)] transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[var(--text-primary)] font-medium">{b.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--text-subtle)]" />}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--sage-tint)] text-[var(--primary-sage)]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-[var(--text-muted)] font-figtree max-w-2xl">{description}</p>
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
    <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs hover:shadow-xs hover:border-[var(--primary-sage)] transition-all group select-none">
      <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider font-figtree">{label}</span>
        {icon && (
          <div className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-outfit text-3xl font-bold text-[var(--text-primary)]">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full font-figtree ${
              isPositive
                ? "bg-[var(--sage-tint)] text-[var(--primary-sage)]"
                : "bg-[var(--negative-rose-tint)] text-[var(--negative-rose)]"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-[var(--text-subtle)] font-figtree mt-2">{subtext}</p>}
    </div>
  );

  return href ? (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)] rounded-2xl">
      {content}
    </Link>
  ) : (
    content
  );
}

// ─── 3. StatusBadge ─────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  let color = "bg-[var(--bg-elevated)] text-[var(--text-muted)]";

  if (["ACTIVE", "BOOKED", "ATTENDED", "SUCCEEDED", "OPEN"].includes(normalized)) {
    color = "bg-[var(--sage-tint)] text-[var(--primary-sage)]";
  } else if (["TRIALING", "WAITLISTED", "PENDING", "FEW_SPOTS"].includes(normalized)) {
    color = "bg-[var(--accent-amber-tint)] text-[var(--accent-amber)]";
  } else if (["PAST_DUE", "FAILED", "MISSED", "CANCELLED", "FULL"].includes(normalized)) {
    color = "bg-[var(--negative-rose-tint)] text-[var(--negative-rose)]";
  } else if (["PAUSED", "COMPLETED"].includes(normalized)) {
    color = "bg-[var(--info-teal-tint)] text-[var(--info-teal)]";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide font-figtree ${color}`}>
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
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] space-y-4 select-none">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-outfit text-lg font-bold text-[var(--text-primary)]">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] font-figtree leading-relaxed">{description}</p>
      </div>
      {action && (
        <div>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] transition-colors shadow-xs font-figtree"
            >
              {action.label}
            </Link>
          ) : (
            <Button
              type="button"
              onClick={action.onClick}
              className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] rounded-xl text-sm font-semibold px-4 py-2 font-figtree shadow-xs"
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
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-[var(--negative-rose-tint)] border border-[var(--negative-rose-tint)] space-y-3 select-none">
      <AlertCircle className="w-8 h-8 text-[var(--negative-rose)]" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--negative-rose)] font-figtree">{message}</p>
        <p className="text-xs text-[var(--text-muted)] font-figtree">Please check your connection and try again.</p>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl text-xs font-semibold px-3.5 py-1.5 text-[var(--negative-rose)] border-[var(--negative-rose)]/30 hover:bg-[var(--negative-rose-tint)]"
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
    <div className="space-y-1.5 w-full select-none font-figtree">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && <span className="font-semibold">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="w-full h-2.5 bg-[var(--border-hairline)] rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-[var(--primary-sage)] transition-all duration-500 rounded-full"
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
    return <span className="text-xs font-bold text-[var(--primary-sage)]">Starting Now</span>;
  }

  return (
    <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[var(--text-primary)]">
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
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
          <span className="text-[var(--primary-sage)] font-semibold">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── 9. Skeletons ───────────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse space-y-3">
      <div className="h-3 w-20 bg-[var(--border-hairline)] rounded-sm" />
      <div className="h-8 w-16 bg-[var(--border-subtle)] rounded-sm" />
      <div className="h-3 w-28 bg-[var(--border-hairline)] rounded-sm" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse space-y-3">
      <div className="h-6 w-1/4 bg-[var(--border-hairline)] rounded-sm" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 w-1/3 bg-[var(--border-hairline)] rounded-sm" />
          <div className="h-4 w-1/4 bg-[var(--border-hairline)] rounded-sm" />
          <div className="h-4 w-1/6 bg-[var(--border-hairline)] rounded-sm" />
        </div>
      ))}
    </div>
  );
}

