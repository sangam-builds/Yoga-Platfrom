"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, Users, Clock, ArrowRight, Play, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NextSessionProps {
  session?: {
    id: string;
    classTitle: string;
    startsAt: string;
    endsAt: string;
    bookedCount: number;
    capacity: number;
    lessonPlanSnippet?: string;
  } | null;
}

export function NextSessionBar({ session }: NextSessionProps) {
  const [canStart, setCanStart] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Default fallback next session if none scheduled today
  const activeSession = session || {
    id: "demo-next-sess",
    classTitle: "Vinyasa Flow • Peak Postures & Breathwork",
    startsAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 85 * 60 * 1000).toISOString(),
    bookedCount: 18,
    capacity: 25,
    lessonPlanSnippet: "Focus on hip mobility, warrior sequence, and guided savasana cooling.",
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const start = new Date(activeSession.startsAt).getTime();
      const diffMs = start - now;

      // Rule: Allowed from 15 minutes before start until end time
      const fifteenMinMs = 15 * 60 * 1000;
      if (diffMs <= fifteenMinMs && diffMs > -60 * 60 * 1000) {
        setCanStart(true);
      } else {
        setCanStart(false);
      }

      if (diffMs <= 0) {
        setTimeRemaining("Session in Progress / Ready");
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        if (hours > 0) {
          setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`Starts in ${minutes}m ${seconds}s`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeSession.startsAt]);

  return (
    <div className="bg-[#233D32] text-[#F8F7F2] px-4 sm:px-6 py-3 rounded-2xl border border-[#3A5D4E] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Session summary */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#6B8F71] text-white flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5 animate-pulse text-amber-200" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#A8C2AC] font-semibold">
              Next Live Class
            </span>
            <span className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeRemaining}
            </span>
          </div>
          <h4 className="font-serif font-bold text-sm sm:text-base text-white truncate">
            {activeSession.classTitle}
          </h4>
          {activeSession.lessonPlanSnippet && (
            <p className="text-xs text-[#A8C2AC] truncate flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-3 h-3 text-stone-300 shrink-0" />
              <span>{activeSession.lessonPlanSnippet}</span>
            </p>
          )}
        </div>
      </div>

      {/* Roster & Start Button */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
        <div className="flex items-center gap-1.5 text-xs text-[#A8C2AC] px-3 py-1.5 rounded-xl bg-black/20 border border-white/5">
          <Users className="w-4 h-4 text-emerald-300" />
          <span>
            <strong className="text-white">{activeSession.bookedCount}</strong> / {activeSession.capacity} Booked
          </span>
        </div>

        <Link href={`/instructor/live?session=${activeSession.id}`}>
          <Button
            size="sm"
            disabled={!canStart}
            className={`font-semibold transition-all gap-2 text-xs shadow-md ${
              canStart
                ? "bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse"
                : "bg-white/10 text-stone-400 cursor-not-allowed hover:bg-white/10"
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {canStart ? "Start Studio Room" : "Opens 15m Prior"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
