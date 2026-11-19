"use client";

import React, { useState } from "react";
import { Video, Clock, Eye, Play, Sparkles, Filter, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorRecordingsPage() {
  const { toast } = useToast();

  const recordings = [
    {
      id: "rec-1",
      title: "Morning Vinyasa Flow • Peak Postures",
      date: new Date(Date.now() - 86400000).toISOString(),
      durationMin: 58,
      status: "READY",
      views: 34,
      visibility: "MEMBERS_ONLY",
    },
    {
      id: "rec-2",
      title: "Hatha Alignment & Pranayama",
      date: new Date(Date.now() - 172800000).toISOString(),
      durationMin: 62,
      status: "READY",
      views: 52,
      visibility: "MEMBERS_ONLY",
    },
    {
      id: "rec-3",
      title: "Yin Yoga for Deep Hip Release",
      date: new Date().toISOString(),
      durationMin: 45,
      status: "PROCESSING",
      views: 0,
      visibility: "DRAFT",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            On-Demand Cloud Archive
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Session Recordings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Review recorded live sessions, manage on-demand student access, and publish replay editions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-2xs space-y-3 hover:border-[var(--primary-sage)]/60 transition-all flex flex-col justify-between font-figtree"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rec.status === "READY"
                      ? "bg-[var(--sage-tint)] text-[var(--primary-sage)]"
                      : "bg-[var(--accent-amber-tint)] text-[var(--accent-amber)]"
                  }`}
                >
                  {rec.status}
                </span>
                <span className="text-[10px] text-[var(--text-subtle)]">
                  {new Date(rec.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                {rec.title}
              </h3>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                  {rec.durationMin} mins
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                  {rec.views} on-demand views
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Recording playback preview launched.")}
                className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--primary-sage)] gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current text-[var(--primary-sage)]" />
                Preview Video
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
