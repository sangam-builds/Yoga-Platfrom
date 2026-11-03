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
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
            {(["week", "day", "list"] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setActiveView(view)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  activeView === view
                    ? "bg-[#233D32] text-white dark:bg-[#6B8F71] dark:text-gray-950"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        }
      />

      {/* ─── Filter Bar ─────────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Style Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium">Style:</span>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
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
            <span className="text-gray-500 font-medium">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
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
            <span className="text-gray-500 font-medium">Duration:</span>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
            >
              <option value="ALL">Any Length</option>
              <option value="short">&lt; 30 mins</option>
              <option value="medium">30 - 60 mins</option>
              <option value="long">&gt; 60 mins</option>
            </select>
          </div>

          {/* Open spots toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(e) => setOpenOnly(e.target.checked)}
              className="rounded text-[#6B8F71] focus:ring-[#6B8F71]"
            />
            <span>Open spots only</span>
          </label>
        </div>

        {/* Active filter chips */}
        {(selectedStyle !== "ALL" || selectedLevel !== "ALL" || selectedDuration !== "ALL" || openOnly) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
            <span className="text-gray-400">Active:</span>
            {selectedStyle !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold">
                {selectedStyle}
                <button type="button" onClick={() => setSelectedStyle("ALL")} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLevel !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-semibold">
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
              className="text-[#6B8F71] font-semibold hover:underline ml-2"
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
            <div key={i} className="h-64 rounded-2xl bg-white dark:bg-gray-900 border animate-pulse" />
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
                className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#6B8F71] transition-all group"
              >
                {/* Class Thumbnail & Badges */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={session.thumbnailUrl || "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600"}
                    alt={session.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#233D32]/80 backdrop-blur-md text-white">
                      {session.style}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/80 backdrop-blur-md text-gray-900">
                      {session.level}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <StatusBadge status={session.spotsStatus} />
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif text-lg font-bold truncate">{session.title}</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
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
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDate(session.startsAt, { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      <span className="font-mono">{formatTime(session.startsAt)}</span>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">{session.description}</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailSession(session)}
                      className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      View Details
                    </button>

                    {isBooked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Booked</span>
                      </span>
                    ) : isWaitlisted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800">
                        <span>Waitlisted</span>
                      </span>
                    ) : isFull ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBookingSession(session)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold border-amber-300 text-amber-800"
                      >
                        Join Waitlist
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setBookingSession(session)}
                        className="rounded-xl px-4 py-1.5 text-xs font-semibold bg-[#233D32] hover:bg-[#6B8F71] text-white shadow-xs"
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
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setDetailSession(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B8F71]">
                Class Overview
              </span>
              <button
                type="button"
                onClick={() => setDetailSession(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {detailSession.title}
              </h2>
              <p className="text-xs text-gray-500">
                {detailSession.style} • {detailSession.level} • {detailSession.durationMin} mins
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {detailSession.description}
            </p>

            {detailSession.benefits && detailSession.benefits.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Key Benefits
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {detailSession.benefits.map((b: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#6B8F71]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor Mini Bio */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={detailSession.instructor.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200"}
                    alt={detailSession.instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {detailSession.instructor.name}
                  </p>
                  <p className="text-[11px] text-gray-500">⭐ {detailSession.instructor.rating.toFixed(1)} Instructor</p>
                </div>
              </div>
              {detailSession.instructor.bio && (
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  &ldquo;{detailSession.instructor.bio}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Starts {formatDate(detailSession.startsAt)} at {formatTime(detailSession.startsAt)}
              </span>
              <Button
                type="button"
                onClick={() => {
                  setBookingSession(detailSession);
                  setDetailSession(null);
                }}
                className="bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-xl text-xs font-semibold px-4 py-2"
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

