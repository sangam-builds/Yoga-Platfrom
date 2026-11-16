"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, RefreshCw, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type PaymentResultStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface PaymentResultData {
  status: PaymentResultStatus;
  planName?: string;
  amountPaise?: number;
  receiptId?: string;
  paymentId?: string;
  errorMessage?: string;
}

interface PaymentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PaymentResultData | null;
  onRetry?: () => void;
}

export function PaymentResultModal({
  isOpen,
  onClose,
  data,
  onRetry,
}: PaymentResultModalProps) {
  const [pollingSeconds, setPollingSeconds] = useState(30);

  useEffect(() => {
    if (!isOpen || data?.status !== "PENDING") return;
    setPollingSeconds(30);

    const timer = setInterval(() => {
      setPollingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, data?.status]);

  if (!isOpen || !data) return null;

  const formatRupees = (paise?: number) => {
    if (!paise) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── SUCCESS STATE ── */}
        {data.status === "SUCCESS" && (
          <div className="space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center ring-8 ring-[var(--sage-tint)]/40 shadow-xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--primary-sage)]">
                PAYMENT CONFIRMED
              </span>
              <h3 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
                Welcome to {data.planName || "Your New Plan"}!
              </h3>
              <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)]">
                Your payment of <strong>{formatRupees(data.amountPaise)}</strong> was successfully verified and your practice entitlements are active.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-[var(--text-muted)]">
                <span>Plan</span>
                <span className="font-semibold text-[var(--text-primary)]">{data.planName}</span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-muted)]">
                <span>Amount Paid</span>
                <span className="font-semibold text-[var(--primary-sage)]">{formatRupees(data.amountPaise)}</span>
              </div>
              {data.paymentId && (
                <div className="flex justify-between items-center text-[var(--text-muted)]">
                  <span>Payment ID</span>
                  <span className="font-mono text-[10px] text-[var(--text-primary)]">{data.paymentId}</span>
                </div>
              )}
              {data.receiptId && (
                <div className="flex justify-between items-center text-[var(--text-muted)]">
                  <span>Receipt ID</span>
                  <span className="font-mono text-[10px] text-[var(--text-primary)]">{data.receiptId}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[var(--primary-sage)] text-white hover:opacity-90 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── FAILED STATE ── */}
        {data.status === "FAILED" && (
          <div className="space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--negative-rose)]/15 text-[var(--negative-rose)] flex items-center justify-center ring-8 ring-[var(--negative-rose)]/10 shadow-xs">
              <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--negative-rose)]">
                PAYMENT UNFULFILLED
              </span>
              <h3 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
                Transaction Incomplete
              </h3>
              <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)]">
                {data.errorMessage || "The transaction was cancelled or declined by your bank. Your card was not charged."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="w-full py-3 rounded-xl text-xs font-semibold"
              >
                Dismiss
              </Button>
              {onRetry && (
                <Button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRetry();
                  }}
                  className="w-full py-3 rounded-xl bg-[var(--primary-sage)] text-white hover:opacity-90 font-semibold text-xs"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── PENDING STATE ── */}
        {data.status === "PENDING" && (
          <div className="space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--accent-amber)]/15 text-[var(--accent-amber)] flex items-center justify-center shadow-xs">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-amber)]">
                VERIFYING PAYMENT
              </span>
              <h3 className="font-outfit text-xl font-bold text-[var(--text-primary)]">
                Confirming with Gateway...
              </h3>
              <p className="font-figtree text-xs text-[var(--text-muted)] leading-relaxed">
                Waiting for the payment confirmation. Time remaining: <strong>{pollingSeconds}s</strong>.
              </p>
            </div>

            <p className="text-[11px] text-[var(--text-muted)]">
              If verification takes longer, your subscription will be activated automatically once the webhook arrives.
            </p>

            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full py-2.5 rounded-xl text-xs"
            >
              Close Window
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
