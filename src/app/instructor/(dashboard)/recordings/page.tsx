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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            On-Demand Cloud Archive
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Session Recordings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Review recorded live sessions, manage on-demand student access, and publish replay editions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border border-[#E9E2D0] p-5 shadow-xs space-y-3 hover:border-[#6B8F71]/60 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    rec.status === "READY"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {rec.status}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {new Date(rec.date).toLocaleDateString()}
                </span>
              </div>

              <h3 className="font-serif font-bold text-base text-[#233D32]">
                {rec.title}
              </h3>
            </div>

            <div className="pt-2 border-t border-[#E9E2D0] space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6B8F71]" />
                  {rec.durationMin} mins
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-400" />
                  {rec.views} on-demand views
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Recording playback preview launched.")}
                className="w-full text-xs border-[#E9E2D0] hover:border-[#6B8F71] gap-1.5"
              >
                <Play className="w-3 h-3 fill-current text-[#6B8F71]" />
                Preview Video
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
