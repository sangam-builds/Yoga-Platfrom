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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
            Upcoming Milestone Roadmap
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-900 dark:text-white">
                {milestonesData?.nextMilestone?.name || "30-Class Mindfulness Master"}
              </span>
              <span className="text-[#6B8F71]">
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
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
          Earned Certificates ({certificates.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 dark:from-gray-900 dark:to-gray-800/80 border border-amber-200/80 dark:border-amber-900/60 shadow-xs space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {cert.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Issued on {formatDate(cert.issuedAt)} • Certified by {cert.signer}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    ID: {cert.code}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-amber-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewCert(cert)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold"
                >
                  View Diploma
                </Button>

                <Button
                  type="button"
                  onClick={() => handleShareLinkedIn(cert)}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-[#0A66C2] hover:bg-[#004182] text-white"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewCert(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#F8F7F2] text-gray-900 rounded-3xl shadow-2xl border-8 border-amber-900/20 p-8 sm:p-12 space-y-6 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-serif uppercase tracking-widest text-[#6B8F71] font-bold">
                ZenFlow Yoga Academy • Official Diploma
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#233D32]">
                Certificate of Completion
              </h2>
            </div>

            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              This certifies that the recipient has demonstrated mindful dedication and completed accredited practice milestones for:
            </p>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
              {previewCert.title}
            </h3>

            <div className="pt-6 border-t border-amber-900/10 flex items-center justify-between text-xs text-gray-600">
              <div className="text-left">
                <span className="font-serif italic block text-sm font-bold text-[#233D32]">
                  Priya Sharma
                </span>
                <span>Senior Acharya</span>
              </div>

              <div className="text-right">
                <span className="font-mono block text-[11px]">{previewCert.code}</span>
                <span>Verified by ZenFlow Platform</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

