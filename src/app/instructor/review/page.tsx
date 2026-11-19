import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InstructorReviewPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-surface)] rounded-3xl p-8 border border-[var(--border-subtle)] shadow-xl text-center space-y-6 font-figtree">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-amber-tint)] border border-[var(--accent-amber)]/30 text-[var(--accent-amber)] flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
            Application Under Review
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Thank you for applying to teach at ZenFlow. Our wellness board is currently reviewing your certifications and background.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-left text-xs text-[var(--text-muted)] space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)] font-outfit">
            <ShieldCheck className="w-4 h-4 text-[var(--primary-sage)]" />
            What happens next:
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>Verification of RYT/Yoga Alliance credentials</li>
            <li>Review takes 24–48 hours on business days</li>
            <li>You will receive an email once approved to start creating classes</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="mailto:instructors@zenflow.yoga">
            <Button variant="outline" className="w-full justify-center gap-2 text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
              <Mail className="w-4 h-4" />
              Contact Instructor Operations
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

