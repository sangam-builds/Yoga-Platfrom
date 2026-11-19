"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  QrCode,
  Copy,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader, ProgressBar, CopyButton } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function CertificatesPage() {
  const { t, formatDate } = useI18n();
  const { toast } = useToast();

  const [previewCert, setPreviewCert] = useState<any | null>(null);

  // Fetch Milestones & Certificates
  const { data: milestonesData, isLoading } = useQuery({
    queryKey: ["user-milestones"],
    queryFn: async () => {
      const res = await fetch("/api/me/milestones");
      if (!res.ok) throw new Error("Failed to load milestones");
      return res.json();
    },
  });

  const certificates = [
    {
      id: "cert-1",
      code: "ZF-2026-FND10-9842",
      title: "10-Class Yoga Foundation Diploma",
      issuedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "ISSUED",
      signer: "Priya Sharma (Senior Acharya)",
      hours: 10,
    },
  ];

  const handleShareLinkedIn = (cert: any) => {
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      cert.title
    )}&organizationName=ZenFlow%20Yoga%20Platform&issueYear=2026&certUrl=${encodeURIComponent(
      `${window.location.origin}/verify/${cert.code}`
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Accredited Certificates & Diplomas"
        description="Earn official certifications as you progress through milestone practice thresholds. Share verifiable credentials on LinkedIn or download printable diplomas."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Certificates" }]}
      />

      {/* ─── 1. Milestone Progress Trackers ───────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs space-y-6 font-figtree select-none">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-[var(--accent-amber)]" />
          <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">
            Upcoming Milestone Roadmap
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-primary)]">
                {milestonesData?.nextMilestone?.name || "30-Class Mindfulness Master"}
              </span>
              <span className="text-[var(--primary-sage)]">
                {milestonesData?.nextMilestone?.current ?? 6} / {milestonesData?.nextMilestone?.target ?? 10} Sessions
              </span>
            </div>
            <ProgressBar
              value={milestonesData?.nextMilestone?.current ?? 6}
              max={milestonesData?.nextMilestone?.target ?? 10}
              showPercentage={true}
            />
          </div>
        </div>
      </div>

      {/* ─── 2. Certificates Gallery ─────────────────────────────────── */}
      <div className="space-y-4 font-figtree">
        <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">
          Earned Certificates ({certificates.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--primary-sage)] transition-all space-y-6 flex flex-col justify-between select-none"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] flex items-center justify-center font-bold shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--sage-tint)] text-[var(--primary-sage)]">
                    {cert.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-outfit text-xl font-bold text-[var(--text-primary)]">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Issued on {formatDate(cert.issuedAt)} • Certified by {cert.signer}
                  </p>
                  <p className="text-[11px] font-mono text-[var(--text-subtle)] mt-0.5">
                    ID: {cert.code}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewCert(cert)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] cursor-pointer"
                >
                  View Diploma
                </Button>

                <Button
                  type="button"
                  onClick={() => handleShareLinkedIn(cert)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] cursor-pointer shadow-xs"
                >
                  Add to LinkedIn
                </Button>

                <CopyButton
                  text={`${window.location.origin}/verify/${cert.code}`}
                  label="Copy Verify Link"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diploma Preview Modal */}
      {previewCert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="w-full max-w-2xl bg-[var(--bg-canvas)] text-[var(--text-primary)] rounded-3xl shadow-2xl border-4 border-[var(--border-subtle)] p-8 sm:p-12 space-y-6 text-center relative font-figtree"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[var(--primary-sage)] font-bold font-outfit">
                ZenFlow Yoga Academy • Official Diploma
              </span>
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                Certificate of Completion
              </h2>
            </div>

            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              This certifies that the recipient has demonstrated mindful dedication and completed accredited practice milestones for:
            </p>

            <h3 className="font-outfit text-xl sm:text-2xl font-bold text-[var(--primary-sage)]">
              {previewCert.title}
            </h3>

            <div className="pt-6 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div className="text-left">
                <span className="font-outfit italic block text-sm font-bold text-[var(--text-primary)]">
                  Priya Sharma
                </span>
                <span>Senior Acharya</span>
              </div>

              <div className="text-right">
                <span className="font-mono block text-[11px] text-[var(--text-subtle)]">{previewCert.code}</span>
                <span>Verified by ZenFlow Platform</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

