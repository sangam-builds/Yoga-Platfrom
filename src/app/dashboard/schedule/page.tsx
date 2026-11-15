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
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] rounded-xl font-figtree">
            {(["week", "day", "list"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  activeView === view
                    ? "bg-[#47664A] text-white shadow-xs"
                    : "text-[#6C7B72] dark:text-[#A4B5A9] hover:bg-[#FAF6EE] dark:hover:bg-[#1F3025]"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        }
      />

      {/* ─── Filter Bar ─────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] shadow-xs space-y-3 font-figtree">
        <div className="flex flex-wrap items-center gap-3">
          {/* Style Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#6C7B72] dark:text-[#A4B5A9] font-medium">Style:</span>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8] focus:outline-none focus:ring-1 focus:ring-[#47664A]"
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
            <span className="text-[#6C7B72] dark:text-[#A4B5A9] font-medium">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8] focus:outline-none focus:ring-1 focus:ring-[#47664A]"
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
            <span className="text-[#6C7B72] dark:text-[#A4B5A9] font-medium">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8] focus:outline-none focus:ring-1 focus:ring-[#47664A]"
            >
              <option value="ALL">Any Length</option>
              <option value="short">&lt; 30 mins</option>
              <option value="medium">30 - 60 mins</option>
              <option value="long">&gt; 60 mins</option>
            </select>
          </div>

          {/* Open spots toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none ml-auto text-[#29352F] dark:text-[#E8EFE8]">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="rounded accent-[#47664A] text-[#47664A] focus:ring-[#47664A]"
            />
            <span>Open spots only</span>
          </label>
        </div>

        {/* Active filter chips */}
        {(selectedStyle !== "ALL" || selectedLevel !== "ALL" || selectedDuration !== "ALL" || openOnly) && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E5DFD4] dark:border-[#283E31] text-xs">
            <span className="text-[#6C7B72] dark:text-[#A4B5A9]">Active:</span>
            {selectedStyle !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E1EDDD] text-[#35523E] font-semibold">
                {selectedStyle}
                <button type="button" onClick={() => setSelectedStyle("ALL")} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLevel !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E1EDDD] text-[#35523E] font-semibold">
                {selectedLevel}
                <button type="button" onClick={() => setSelectedLevel("ALL")} className="hover:text-rose-500">
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
              className="text-[#47664A] dark:text-[#8BB394] font-semibold hover:underline ml-2"
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
            <div key={i} className="h-64 rounded-2xl bg-[#FAF6EE] dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] animate-pulse" />
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
                className="rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#47664A] transition-all group"
              >
                {/* Class Thumbnail & Badges */}
                <div className="relative h-44 w-full bg-[#FAF6EE] overflow-hidden">
                  <img
                    src={session.thumbnailUrl || "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600"}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-outfit uppercase tracking-wider bg-[#47664A]/90 backdrop-blur-md text-white">
                      {session.style}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-outfit uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#29352F]">
                      {session.level}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge status={session.spotsStatus} />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-outfit text-lg font-semibold truncate text-white">{session.title}</h3>
                    <p className="text-xs text-white/90 font-figtree flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{session.durationMin} mins</span>
                      <span>•</span>
                      <span>{session.instructor.name}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#6C7B72] dark:text-[#A4B5A9] font-figtree">
                      <span className="font-semibold text-[#29352F] dark:text-[#E8EFE8]">
                        {formatDate(session.startsAt, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <span className="font-mono text-[#47664A] dark:text-[#8BB394] font-semibold">{formatTime(session.startsAt)}</span>
                    </div>

                    <p className="text-xs text-[#6C7B72] dark:text-[#A4B5A9] font-figtree line-clamp-2">{session.description}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#E5DFD4] dark:border-[#283E31] flex items-center justify-between gap-2 font-figtree">
                    <button
                      type="button"
                      onClick={() => setDetailSession(session)}
                      className="text-xs font-semibold text-[#6C7B72] dark:text-[#A4B5A9] hover:text-[#29352F] dark:hover:text-[#E8EFE8]"
                    >
                      View Details
                    </button>

                    {isBooked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E1EDDD] text-[#35523E] dark:bg-[#223528] dark:text-[#A7C7A8]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Booked</span>
                      </span>
                    ) : isWaitlisted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FAF2E6] text-[#8C6228]">
                        <span>Waitlisted</span>
                      </span>
                    ) : isFull ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBookingSession(session)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold border-[#D1DBCF] text-[#8C6228] bg-[#FAF2E6]/50"
                      >
                        Join Waitlist
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setBookingSession(session)}
                        className="rounded-xl px-4 py-1.5 text-xs font-semibold bg-[#47664A] hover:bg-[#3B563E] text-white shadow-xs"
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
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in font-figtree"
          onClick={() => setDetailSession(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[#FAF6ED] dark:bg-[#16241C] border-l border-[#D1DBCF] dark:border-[#283E31] shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D1DBCF] dark:border-[#283E31]">
              <span className="font-outfit text-[11px] font-bold uppercase tracking-[0.22em] text-[#607B6A]">
                Class Overview
              </span>
              <button
                type="button"
                onClick={() => setDetailSession(null)}
                className="p-1 rounded-lg text-[#6C7B72] hover:text-[#29352F] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="font-outfit text-2xl font-semibold text-[#29352F] dark:text-[#E8EFE8]">
                {detailSession.title}
              </h2>
              <p className="font-figtree text-xs text-[#6C7B72] dark:text-[#A4B5A9]">
                {detailSession.style} • {detailSession.level} • {detailSession.durationMin} mins
              </p>
            </div>

            <p className="font-figtree text-sm text-[#29352F]/90 dark:text-[#E8EFE8]/90 leading-relaxed">
              {detailSession.description}
            </p>

            {detailSession.benefits && detailSession.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-outfit text-[11px] font-bold uppercase tracking-[0.2em] text-[#607B6A]">
                  Key Benefits
                </h4>
                <ul className="space-y-1.5 text-xs text-[#6C7B72] dark:text-[#A4B5A9]">
                  {detailSession.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#47664A]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Mini Bio */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1A2A21] border border-[#D1DBCF] dark:border-[#283E31] space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E1EDDD] overflow-hidden">
                  <img
                    src={detailSession.instructor.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"}
                    alt={detailSession.instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-outfit text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8]">
                    {detailSession.instructor.name}
                  </p>
                  <p className="font-figtree text-[11px] text-[#6C7B72] dark:text-[#A4B5A9]">⭐ {detailSession.instructor.rating.toFixed(1)} Instructor</p>
                </div>
              </div>
              {detailSession.instructor.bio && (
                <p className="font-figtree text-xs text-[#6C7B72] dark:text-[#A4B5A9] italic">
                  &ldquo;{detailSession.instructor.bio}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#D1DBCF] dark:border-[#283E31] flex items-center justify-between">
              <span className="font-figtree text-xs text-[#6C7B72] dark:text-[#A4B5A9]">
                Starts {formatDate(detailSession.startsAt)} at {formatTime(detailSession.startsAt)}
              </span>
              <Button
                type="button"
                onClick={() => {
                  setBookingSession(detailSession);
                  setDetailSession(null);
                }}
                className="bg-[#47664A] hover:bg-[#3B563E] text-white rounded-xl text-xs font-semibold px-4 py-2 font-figtree"
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

