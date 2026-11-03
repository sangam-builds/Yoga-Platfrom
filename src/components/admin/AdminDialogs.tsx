"use client";

import React, { useState } from "react";
import { AlertTriangle, Lock, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface StepUpAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, authPasscode: string) => void;
  title: string;
  description: string;
  actionLabel?: string;
  requiresReason?: boolean;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function StepUpAuthDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  actionLabel = "Authorize Sensitive Action",
  requiresReason = true,
  isDestructive = true,
  isLoading = false,
}: StepUpAuthDialogProps) {
  const [reason, setReason] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresReason && reason.trim().length < 5) {
      setError("Please provide a justification (min 5 characters) for the audit trail.");
      return;
    }
    if (!passcode) {
      setError("Please confirm your admin password or MFA code.");
      return;
    }
    setError(null);
    onConfirm(reason.trim(), passcode);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-7 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Step-Up Re-Authentication Required
          </span>
          <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requiresReason && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Audit Justification / Reason <span className="text-rose-500">*</span>:
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Student requested full refund per ticket #4029..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span>Admin Password or MFA Token <span className="text-rose-500">*</span>:</span>
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Confirm password"
              className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
              required
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 py-2 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white ${
                isDestructive ? "bg-rose-600 hover:bg-rose-700" : "bg-[#233D32] hover:bg-[#6B8F71]"
              }`}
            >
              {actionLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

