"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Calendar, Clock, X, ExternalLink, Sparkles, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Pill } from "@/components/dashboard/ui/Pill";

interface Booking {
  id: string;
  startsAt: string;
  endsAt: string;
  session: {
    id: string;
    class: {
      id: string;
      title: string;
      level: string;
      style: string;
      durationMin: number;
    };
    instructor: {
      name: string;
      avatarUrl?: string;
    };
  };
}

interface NextClassHeroCardProps {
  booking?: Booking | null;
  onCancelBooking?: (id: string) => void;
  className?: string;
}

export function NextClassHeroCard({
  booking,
  onCancelBooking,
  className = "",
}: NextClassHeroCardProps) {
  const { formatDate, formatTime } = useI18n();

  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isJoinable, setIsJoinable] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!booking) return;

    const checkTime = () => {
      const now = Date.now();
      const start = new Date(booking.startsAt).getTime();
      const end = new Date(booking.endsAt).getTime();

      const joinWindowStart = start - 10 * 60 * 1000;
      setIsJoinable(now >= joinWindowStart && now <= end);
      setIsLive(now >= start && now <= end);

      const diff = start - now;
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  if (!booking) {
    return (
      <div
        className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between select-none ${className}`}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
              NEXT UP ON YOUR MAT
            </span>
            <Pill variant="default">No Bookings</Pill>
          </div>
          <div className="w-11 h-11 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-outfit font-semibold text-lg text-[var(--text-primary)] mb-1">
            Your schedule is wide open
          </h3>
          <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
            Reserve your spot in an upcoming morning flow or evening restorative session.
          </p>
        </div>

        <Link
          href="/dashboard/schedule"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] font-figtree font-medium text-xs sm:text-sm transition-all duration-200 shadow-xs cursor-pointer group"
        >
          <span>Find a class today</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  const { session } = booking;
  const yogaClass = session.class;
  const instructor = session.instructor;

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs select-none relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sage-tint)]/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Top Bar: Eyebrow + Live / Countdown badge */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            YOUR NEXT CLASS
          </span>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative-rose)]" />
              LIVE NOW
            </span>
          ) : isJoinable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--sage-tint)] text-[var(--primary-sage)] animate-pulse">
              JOIN WINDOW OPEN
            </span>
          ) : timeLeft ? (
            <span className="font-figtree text-xs font-semibold text-[var(--text-muted)] inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
              <span>
                Starts in {timeLeft.hours > 0 ? `${timeLeft.hours}h ` : ""}
                {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </span>
          ) : null}
        </div>

        {/* Class Title & Details */}
        <h3 className="font-outfit font-semibold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight mb-2">
          {yogaClass.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Pill variant="attended" size="sm">
            {yogaClass.style}
          </Pill>
          <Pill variant="default" size="sm">
            {yogaClass.level}
          </Pill>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
            <span>{yogaClass.durationMin} mins</span>
          </span>
        </div>

        {/* Instructor & Time */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)]/60 border border-[var(--border-hairline)] mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] font-outfit font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
            {instructor.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-figtree text-xs font-semibold text-[var(--text-primary)] truncate">
              {instructor.name}
            </p>
            <p className="font-figtree text-[11px] text-[var(--text-muted)] truncate">
              {formatDate(booking.startsAt)} &middot; {formatTime(booking.startsAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
        {isJoinable ? (
          <Link
            href={`/dashboard/live/${session.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] font-figtree font-semibold text-sm transition-all shadow-xs cursor-pointer animate-pulse"
          >
            <Video className="w-4 h-4" />
            <span>Join Class Now</span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)] font-figtree font-medium text-xs sm:text-sm border border-[var(--border-subtle)] cursor-not-allowed opacity-80"
          >
            <Video className="w-4 h-4 text-[var(--text-subtle)]" />
            <span>Join opens 10m before</span>
          </button>
        )}

        {onCancelBooking && (
          <button
            type="button"
            onClick={() => onCancelBooking(booking.id)}
            className="px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--negative-rose-tint)] hover:text-[var(--negative-rose)] hover:border-[var(--negative-rose)]/30 text-[var(--text-muted)] font-figtree font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
