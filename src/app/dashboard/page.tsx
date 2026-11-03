"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Flame,
  Calendar,
  Clock,
  Award,
  Video,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  Bot,
  ChevronRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import {
  StatCard,
  StatusBadge,
  ProgressBar,
  Countdown,
  StatCardSkeleton,
} from "@/components/dashboard/shared/UIBlocks";

export default function DashboardOverviewPage() {
  const { t, formatDate, formatTime } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  // 1. User & Profile
  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to load user");
      return res.json();
    },
  });

  // 2. Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await fetch("/api/me/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  // 3. Subscription
  const { data: subData } = useQuery({
    queryKey: ["user-subscription"],
    queryFn: async () => {
      const res = await fetch("/api/me/subscription");
      if (!res.ok) throw new Error("Failed to load subscription");
      return res.json();
    },
  });

  // 4. Upcoming Bookings & Next Class
  const { data: bookingsData } = useQuery({
    queryKey: ["user-bookings-upcoming"],
    queryFn: async () => {
      const res = await fetch("/api/me/bookings?status=upcoming");
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
  });

  // 5. Badges
  const { data: badgesData } = useQuery({
    queryKey: ["user-badges"],
    queryFn: async () => {
      const res = await fetch("/api/me/badges");
      if (!res.ok) throw new Error("Failed to load badges");
      return res.json();
    },
  });

  // 6. Milestones
  const { data: milestonesData } = useQuery({
    queryKey: ["user-milestones"],
    queryFn: async () => {
      const res = await fetch("/api/me/milestones");
      if (!res.ok) throw new Error("Failed to load milestones");
      return res.json();
    },
  });

  // Cancel Booking Mutation with optimistic updates
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Booking cancelled successfully", data.message);
      queryClient.invalidateQueries({ queryKey: ["user-bookings-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
      setCancelBookingId(null);
    },
    onError: (err: any) => {
      toast.error("Cancellation failed", err.message);
    },
  });

  const user = userData?.user;
  const firstName = user?.name ? user.name.split(" ")[0] : "Yogi";
  const nextBooking = bookingsData?.bookings?.[0];

  // Compute greeting by hour of day
  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "overview.welcomeMorning"
      : hour < 17
      ? "overview.welcomeAfternoon"
      : "overview.welcomeEvening";

  // Check if join window is open (within 10 minutes of start until end)
  const isJoinWindowOpen = (startsAtStr: string, endsAtStr: string) => {
    const now = Date.now();
    const start = new Date(startsAtStr).getTime();
    const end = new Date(endsAtStr).getTime();
    return now >= start - 10 * 60 * 1000 && now <= end;
  };

  const isLiveNow = (startsAtStr: string, endsAtStr: string) => {
    const now = Date.now();
    const start = new Date(startsAtStr).getTime();
    const end = new Date(endsAtStr).getTime();
    return now >= start && now <= end;
  };

  const isBrandNewUser =
    bookingsData && bookingsData.bookings.length === 0 && (statsData?.totalClasses ?? 0) === 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ─── 1. Welcome Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60 dark:border-gray-800">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t(greetingKey)}, {firstName} 🙏
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {formatDate(new Date(), { dateStyle: "full" })} •{" "}
            {(statsData?.currentStreak ?? 0) > 0 ? t("overview.streakActive") : t("overview.streakNone")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/schedule"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#233D32] hover:bg-[#6B8F71] text-white shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{t("overview.browseSchedule")}</span>
          </Link>
        </div>
      </div>

      {/* ─── Guided First Steps (for brand-new yogis) ─────────────────── */}
      {isBrandNewUser && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-serif font-bold text-base sm:text-lg text-emerald-950 dark:text-emerald-200">
                Welcome to ZenFlow! Your First Steps Checklist
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
              Getting Started
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/dashboard/settings"
              className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 hover:border-emerald-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300">
                1
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-900 dark:text-white">Complete Profile</p>
                <p className="text-gray-500">Goals & experience level</p>
              </div>
            </Link>

            <Link
              href="/dashboard/schedule"
              className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 hover:border-emerald-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300">
                2
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-900 dark:text-white">Book First Class</p>
                <p className="text-gray-500">Pick live sunrise session</p>
              </div>
            </Link>

            <Link
              href="/dashboard/poses"
              className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 hover:border-emerald-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-300">
                3
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-900 dark:text-white">Explore Asanas</p>
                <p className="text-gray-500">Browse pose library</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ─── 2. Next Class Card & Membership Summary ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Class Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t("overview.nextClass")}
            </span>
            {nextBooking && (
              <StatusBadge status={isLiveNow(nextBooking.startsAt, nextBooking.endsAt) ? "LIVE_NOW" : "BOOKED"} />
            )}
          </div>

          {nextBooking ? (
            <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#233D32]/10 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                  <img
                    src={nextBooking.thumbnailUrl || nextBooking.instructor.avatarUrl || "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300"}
                    alt={nextBooking.classTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                    {nextBooking.classTitle}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    With {nextBooking.instructor.name} • {nextBooking.durationMin} mins • {nextBooking.level}
                  </p>
                  <p className="text-xs font-semibold text-[#6B8F71]">
                    {formatDate(nextBooking.startsAt, { weekday: "short", month: "short", day: "numeric" })} at{" "}
                    {formatTime(nextBooking.startsAt)}
                  </p>
                </div>
              </div>

              {/* Countdown & Join Action */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <Countdown targetDate={nextBooking.startsAt} />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isJoinWindowOpen(nextBooking.startsAt, nextBooking.endsAt) ? (
                    <Link
                      href={nextBooking.videoRoomUrl}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6B8F71] hover:bg-[#233D32] text-white animate-pulse shadow-md transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      <span>{t("common.join")}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      title="Join button activates 10 minutes prior to session"
                    >
                      Opens 10m before start
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setCancelBookingId(nextBooking.id)}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto" />
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t("overview.noUpcoming")}</p>
              <Link
                href="/dashboard/schedule"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B8F71] hover:underline"
              >
                <span>{t("overview.browseSchedule")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Free cancellation up to 2 hours before start</span>
            <Link href="/dashboard/bookings" className="text-[#6B8F71] hover:underline font-semibold">
              View all bookings ({bookingsData?.bookings?.length || 0})
            </Link>
          </div>
        </div>

        {/* Membership Summary Tile */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Membership
            </span>
            <StatusBadge status={subData?.status || "ACTIVE"} />
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              {subData?.plan?.name || "7-Day Free Trial"}
            </h3>
            <p className="text-xs text-gray-500">
              Renews on {formatDate(subData?.renewalDate || new Date())}
            </p>
          </div>

          <div className="space-y-1.5">
            <ProgressBar
              value={subData?.creditsRemaining ?? 4}
              max={subData?.totalCredits ?? 5}
              label="Credits Remaining"
              showPercentage={false}
            />
            <p className="text-[11px] text-gray-500 text-right">
              {subData?.creditsRemaining ?? 4} of {subData?.totalCredits ?? 5} credits available
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/dashboard/membership"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B8F71] hover:underline"
            >
              <span>Manage Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/membership#credits"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
            >
              Buy Credits
            </Link>
          </div>
        </div>
      </div>

      {/* ─── 3. Stats Row (4 Tiles) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label={t("overview.streak")}
              value={`${statsData?.currentStreak ?? 4} days`}
              icon={<Flame className="w-4 h-4 text-amber-500" />}
              subtext={`Best: ${statsData?.longestStreak ?? 14} days`}
              href="/dashboard/attendance"
            />
            <StatCard
              label={t("overview.totalClasses")}
              value={statsData?.totalClasses ?? 18}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              subtext="Lifetime sessions"
              href="/dashboard/attendance"
            />
            <StatCard
              label={t("overview.totalHours")}
              value={`${statsData?.totalHours ?? 15}h`}
              icon={<Clock className="w-4 h-4 text-blue-500" />}
              subtext="Total mat time"
              href="/dashboard/attendance"
            />
            <StatCard
              label={t("overview.thisMonth")}
              value={statsData?.classesThisMonth ?? 6}
              change={statsData?.monthChange}
              isPositive={statsData?.isPositiveChange}
              icon={<Calendar className="w-4 h-4 text-purple-500" />}
              subtext="Current calendar month"
              href="/dashboard/attendance"
            />
          </>
        )}
      </div>

      {/* ─── 4. Heatmap & Milestones Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Mini Heatmap */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6B8F71]" />
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
                {t("overview.attendanceHeatmap")}
              </h3>
            </div>
            <Link
              href="/dashboard/attendance"
              className="text-xs font-semibold text-[#6B8F71] hover:underline inline-flex items-center gap-1"
            >
              <span>Full Tracker</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 12-week Heatmap grid visualization */}
          <div className="space-y-2">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto py-2">
              {Array.from({ length: 84 }).map((_, i) => {
                const isPracticed = (i * 7 + 3) % 4 === 0 || i % 6 === 0;
                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                      isPracticed
                        ? "bg-[#6B8F71] dark:bg-[#6B8F71]"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                    title={isPracticed ? `Practiced 60 mins` : "Rest day"}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span>12 weeks ago</span>
              <div className="flex items-center gap-1.5">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-xs bg-gray-100 dark:bg-gray-800" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#6B8F71]/40" />
                <span className="w-2.5 h-2.5 rounded-xs bg-[#6B8F71]" />
                <span>More</span>
              </div>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-500">
              <Award className="w-4 h-4" />
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
                Next Certificate
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              {milestonesData?.nextMilestone?.name || "10-Class Foundation"}
            </p>
          </div>

          <div className="space-y-2">
            <ProgressBar
              value={milestonesData?.nextMilestone?.current ?? 6}
              max={milestonesData?.nextMilestone?.target ?? 10}
              label={`${milestonesData?.nextMilestone?.current ?? 6} of ${milestonesData?.nextMilestone?.target ?? 10} classes`}
            />
            <p className="text-[11px] text-gray-500">
              {Math.max(
                0,
                (milestonesData?.nextMilestone?.target ?? 10) - (milestonesData?.nextMilestone?.current ?? 6)
              )}{" "}
              more sessions to unlock your accredited certificate!
            </p>
          </div>

          <Link
            href="/dashboard/certificates"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B8F71] hover:underline"
          >
            <span>View All Milestones</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ─── 5. Badges Strip & Quick Actions ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges Strip */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
              {t("overview.badgesEarned")}
            </h3>
            <Link href="/dashboard/certificates" className="text-xs font-semibold text-[#6B8F71] hover:underline">
              View Trophy Case
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badgesData?.earned?.map((b: any) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-900 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-300 font-bold">
                  🏆
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{b.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{b.description}</p>
                </div>
              </div>
            )) || (
              <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  🌱
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">First Breath</p>
                  <p className="text-[10px] text-gray-500">Book your first class to earn</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions (Section 5) */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-3">
          <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
            {t("overview.quickActions")}
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/schedule"
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#6B8F71] flex flex-col items-center text-center gap-1.5 transition-colors group"
            >
              <Calendar className="w-5 h-5 text-[#6B8F71]" />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#6B8F71]">
                Book Class
              </span>
            </Link>

            <Link
              href="/dashboard/membership#credits"
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#6B8F71] flex flex-col items-center text-center gap-1.5 transition-colors group"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-amber-600">
                Buy Credits
              </span>
            </Link>

            <Link
              href="/dashboard/settings#referrals"
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#6B8F71] flex flex-col items-center text-center gap-1.5 transition-colors group"
            >
              <UserPlus className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600">
                Invite Friend
              </span>
            </Link>

            <Link
              href="/dashboard/assistant"
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-[#6B8F71] flex flex-col items-center text-center gap-1.5 transition-colors group"
            >
              <Bot className="w-5 h-5 text-purple-500" />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-600">
                AI Assistant
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onConfirm={() => cancelBookingId && cancelMutation.mutate(cancelBookingId)}
        title="Cancel Yoga Class Booking?"
        description="Are you sure you want to cancel this booking? Cancellations made at least 2 hours before the start time will refund 1 class credit back to your account."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        isDestructive={true}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
