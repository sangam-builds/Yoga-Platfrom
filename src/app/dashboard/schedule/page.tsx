"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Filter,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { StatusBadge, PageHeader, EmptyState } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function SchedulePage() {
  const { t, formatDate, formatTime } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters state
  const [selectedStyle, setSelectedStyle] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedDuration, setSelectedDuration] = useState<string>("ALL");
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"week" | "day" | "list">("week");

  // Selected session for Detail Drawer & Booking Modal
  const [detailSession, setDetailSession] = useState<any | null>(null);
  const [bookingSession, setBookingSession] = useState<any | null>(null);

  // Fetch Sessions
  const { data, isLoading } = useQuery({
    queryKey: ["schedule-sessions", selectedStyle, selectedLevel, selectedDuration, openOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStyle !== "ALL") params.set("style", selectedStyle);
      if (selectedLevel !== "ALL") params.set("level", selectedLevel);
      if (selectedDuration !== "ALL") params.set("duration", selectedDuration);
      if (openOnly) params.set("openOnly", "true");

      const res = await fetch(`/api/sessions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
  });

  // Booking Mutation
  const bookMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/sessions/${sessionId}/book`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to book session");
      return resData;
    },
    onSuccess: (resData) => {
      if (resData.waitlisted) {
        toast.info("Added to Waitlist", `You are in position #${resData.position}.`);
      } else {
        toast.success(
          "Class Booked Successfully! 🎉",
          `Booking Ref: ${resData.bookingNumber}. Check My Bookings for details.`
        );
      }
      queryClient.invalidateQueries({ queryKey: ["schedule-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
      setBookingSession(null);
      setDetailSession(null);
    },
    onError: (err: any) => {
      toast.error("Booking failed", err.message);
    },
  });

  const sessions = data?.sessions || [];

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Live Class Schedule"
        description="Book your interactive live yoga sessions led by certified Himalayan tradition masters."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Schedule" }]}
        action={
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
            {(["week", "day", "list"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors font-figtree cursor-pointer ${
                  activeView === view
                    ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        }
      />

      {/* ─── Filter Bar ─────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs space-y-3 font-figtree">
        <div className="flex flex-wrap items-center gap-3">
          {/* Style Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Style:</span>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary-sage)] cursor-pointer"
            >
              <option value="ALL">All Styles</option>
              <option value="VINYASA">Vinyasa Flow</option>
              <option value="HATHA">Hatha Yoga</option>
              <option value="YIN">Yin Yoga</option>
              <option value="POWER">Power Yoga</option>
              <option value="MEDITATION">Meditation & Pranayama</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary-sage)] cursor-pointer"
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ALL_LEVELS">All Levels Welcome</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--text-muted)] font-medium">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary-sage)] cursor-pointer"
            >
              <option value="ALL">Any Length</option>
              <option value="short">&lt; 30 mins</option>
              <option value="medium">30 - 60 mins</option>
              <option value="long">&gt; 60 mins</option>
            </select>
          </div>

          {/* Open spots toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none ml-auto text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="rounded accent-[var(--primary-sage)] focus:ring-[var(--primary-sage)]"
            />
            <span>Open spots only</span>
          </label>
        </div>

        {/* Active filter chips */}
        {(selectedStyle !== "ALL" || selectedLevel !== "ALL" || selectedDuration !== "ALL" || openOnly) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-hairline)] text-xs">
            <span className="text-[var(--text-muted)]">Active:</span>
            {selectedStyle !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-[var(--text-primary)] font-semibold">
                {selectedStyle}
                <button type="button" onClick={() => setSelectedStyle("ALL")} className="hover:text-[var(--negative-rose)] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLevel !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-[var(--text-primary)] font-semibold">
                {selectedLevel}
                <button type="button" onClick={() => setSelectedLevel("ALL")} className="hover:text-[var(--negative-rose)] cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedStyle("ALL");
                setSelectedLevel("ALL");
                setSelectedDuration("ALL");
                setOpenOnly(false);
              }}
              className="text-[var(--primary-sage)] font-semibold hover:underline ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ─── Sessions Grid ──────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No sessions found matching filters"
          description="Try relaxing your filters or check back later for newly scheduled live yoga classes."
          action={{
            label: "Reset Filters",
            onClick: () => {
              setSelectedStyle("ALL");
              setSelectedLevel("ALL");
              setSelectedDuration("ALL");
              setOpenOnly(false);
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session: any) => {
            const isBooked = session.userState === "BOOKED";
            const isWaitlisted = session.userState === "WAITLISTED";
            const isFull = session.spotsRemaining === 0;

            return (
              <div
                key={session.id}
                className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-[var(--primary-sage)] transition-all group select-none"
              >
                {/* Class Thumbnail & Badges */}
                <div className="relative h-44 w-full bg-[var(--border-hairline)] overflow-hidden">
                  <img
                    src={session.thumbnailUrl || "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600"}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--primary-sage)]/90 backdrop-blur-md text-[var(--on-primary)]">
                      {session.style}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--bg-surface)]/90 backdrop-blur-md text-[var(--text-primary)]">
                      {session.level}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge status={session.spotsStatus} />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-outfit text-lg font-bold truncate">{session.title}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5 font-figtree">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{session.durationMin} mins</span>
                      <span>•</span>
                      <span>{session.instructor.name}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between font-figtree">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {formatDate(session.startsAt, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <span className="font-mono">{formatTime(session.startsAt)}</span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">{session.description}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailSession(session)}
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {isBooked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--sage-tint)] text-[var(--primary-sage)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Booked</span>
                      </span>
                    ) : isWaitlisted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--accent-amber-tint)] text-[var(--accent-amber)]">
                        <span>Waitlisted</span>
                      </span>
                    ) : isFull ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBookingSession(session)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold border-[var(--accent-amber)] text-[var(--accent-amber)] hover:bg-[var(--accent-amber-tint)] cursor-pointer"
                      >
                        Join Waitlist
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setBookingSession(session)}
                        className="rounded-xl px-4 py-1.5 text-xs font-semibold bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] shadow-xs cursor-pointer font-figtree"
                      >
                        Book Class
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Class Detail Drawer ────────────────────────────────────── */}
      {detailSession && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDetailSession(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right font-figtree"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary-sage)] font-outfit">
                Class Overview
              </span>
              <button
                type="button"
                onClick={() => setDetailSession(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
                {detailSession.title}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {detailSession.style} • {detailSession.level} • {detailSession.durationMin} mins
              </p>
            </div>

            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {detailSession.description}
            </p>

            {detailSession.benefits && detailSession.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-outfit">
                  Key Benefits
                </h4>
                <ul className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  {detailSession.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Mini Bio */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--border-hairline)] overflow-hidden shrink-0">
                  <img
                    src={detailSession.instructor.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"}
                    alt={detailSession.instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)] font-outfit">
                    {detailSession.instructor.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">⭐ {detailSession.instructor.rating.toFixed(1)} Instructor</p>
                </div>
              </div>
              {detailSession.instructor.bio && (
                <p className="text-xs text-[var(--text-muted)] italic">
                  &ldquo;{detailSession.instructor.bio}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Starts {formatDate(detailSession.startsAt)} at {formatTime(detailSession.startsAt)}
              </span>
              <Button
                type="button"
                onClick={() => {
                  setBookingSession(detailSession);
                  setDetailSession(null);
                }}
                className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] rounded-xl text-xs font-semibold px-4 py-2 cursor-pointer shadow-xs font-figtree"
              >
                Continue to Book
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Booking Confirmation Dialog ────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!bookingSession}
        onClose={() => setBookingSession(null)}
        onConfirm={() => bookingSession && bookMutation.mutate(bookingSession.id)}
        title={bookingSession?.spotsRemaining === 0 ? "Join Waitlist?" : "Confirm Class Booking"}
        description={
          bookingSession?.spotsRemaining === 0
            ? `This session is full. Would you like to join the waitlist for "${bookingSession?.title}"? If a spot opens, you will be notified automatically.`
            : `Confirm booking for "${bookingSession?.title}" on ${
                bookingSession ? formatDate(bookingSession.startsAt) : ""
              } at ${bookingSession ? formatTime(bookingSession.startsAt) : ""}? 1 class credit (or unlimited subscription access) will be applied.`
        }
        confirmLabel={bookingSession?.spotsRemaining === 0 ? "Join Waitlist" : "Confirm & Book"}
        cancelLabel="Back to Schedule"
        isLoading={bookMutation.isPending}
      />
    </div>
  );
}

