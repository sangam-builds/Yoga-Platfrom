"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not load this section. Please try again.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-[var(--negative-rose)]/20 bg-[var(--negative-rose-tint)]/40 p-6 sm:p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 stroke-[2]" />
      </div>
      <h4 className="font-outfit font-semibold text-base text-[var(--text-primary)] mb-1">
        {title}
      </h4>
      <p className="font-figtree text-xs text-[var(--text-muted)] max-w-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
