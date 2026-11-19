import React from "react";
import Link from "next/link";
import { AlertTriangle, Mail, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InstructorSuspendedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--negative-rose)]/30 shadow-xl text-center space-y-6 font-figtree">
        <div className="w-16 h-16 rounded-2xl bg-[var(--negative-rose-tint)] border border-[var(--negative-rose)]/20 text-[var(--negative-rose)] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
            Instructor Account Suspended
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Your teaching access is currently paused. Future class sessions cannot be initiated or scheduled during suspension.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--accent-amber-tint)] border border-[var(--accent-amber)]/30 text-left text-xs text-[var(--accent-amber)] space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)]" />
            Notice:
          </div>
          <p className="text-[var(--text-muted)]">
            Past earnings and payout history remain accessible. For inquiries or resolution regarding your account status, please reach out to operations.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="mailto:support@zenflow.yoga">
            <Button variant="outline" className="w-full justify-center gap-2 text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
              <Mail className="w-4 h-4" />
              Contact Instructor Support
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full justify-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

