"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Video,
  X,
  RefreshCw,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { StatusBadge, PageHeader, EmptyState } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function MyBookingsPage() {
  const { t, formatDate, formatTime } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled" | "waitlisted">("upcoming");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  // Fetch Bookings
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/me/bookings?status=${activeTab}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
  });

  // Cancel Booking Mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to cancel booking");
      return resData;
    },
    onSuccess: (resData) => {
      toast.success("Booking Cancelled", resData.message);
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
      setCancelBookingId(null);
    },
    onError: (err: any) => {
      toast.error("Cancellation Failed", err.message);
    },
  });

  const bookings = data?.bookings || [];
  const waitlist = data?.waitlist || [];

  // Helper for Google Calendar Link
  const getGoogleCalendarUrl = (booking: any) => {
    const startIso = new Date(booking.startsAt).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endIso = new Date(booking.endsAt).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(`ZenFlow: ${booking.classTitle}`);
    const details = encodeURIComponent(
      `Live Yoga class with ${booking.instructor.name}. Join at: ${window.location.origin}${booking.videoRoomUrl}`
    );
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
  };

  // Helper for .ics file download
  const downloadIcs = (booking: any) => {
    const icsContent =
      `BEGIN:VCALENDAR\n` +
      `VERSION:2.0\n` +
      `PRODID:-//ZenFlow Yoga//EN\n` +
      `BEGIN:VEVENT\n` +
      `SUMMARY:ZenFlow: ${booking.classTitle}\n` +
      `DESCRIPTION:Live session with ${booking.instructor.name}\n` +
      `DTSTART:${new Date(booking.startsAt).toISOString().replace(/-|:|\.\d\d\d/g, "")}\n` +
      `DTEND:${new Date(booking.endsAt).toISOString().replace(/-|:|\.\d\d\d/g, "")}\n` +
      `STATUS:CONFIRMED\n` +
      `END:VEVENT\n` +
      `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${booking.classTitle.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isJoinWindowOpen = (startsAtStr: string, endsAtStr: string) => {
    const now = Date.now();
    const start = new Date(startsAtStr).getTime();
    const end = new Date(endsAtStr).getTime();
    return now >= start - 10 * 60 * 1000 && now <= end;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="My Bookings & Waitlist"
        description="Manage your upcoming live sessions, join interactive rooms, or add classes to your personal calendar."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Bookings" }]}
      />

      {/* ─── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto text-xs font-semibold">
        {(["upcoming", "past", "cancelled", "waitlisted"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl capitalize transition-all ${
              activeTab === tab
                ? "bg-[#233D32] text-white dark:bg-[#6B8F71] dark:text-gray-950 font-bold shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Bookings List View ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4 py-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-gray-900 border animate-pulse" />
          ))}
        </div>
      ) : activeTab === "waitlisted" ? (
        waitlist.length === 0 ? (
          <EmptyState
            title="No Waitlisted Classes"
            description="You are currently not on any class waitlists. Explore the live schedule to find upcoming open spots."
            action={{ label: "View Schedule", href: "/dashboard/schedule" }}
          />
        ) : (
          <div className="space-y-3">
            {waitlist.map((item: any) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
                      {item.classTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Position #{item.position}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    With {item.instructor.name} • {formatDate(item.startsAt)} at {formatTime(item.startsAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => toast.info("Waitlist entry removed")}
                >
                  Leave Waitlist
                </Button>
              </div>
            ))}
          </div>
        )
      ) : bookings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} bookings`}
          description={`You do not have any ${activeTab} classes on record.`}
          action={activeTab === "upcoming" ? { label: "Browse Schedule", href: "/dashboard/schedule" } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => {
            const joinAllowed = isJoinWindowOpen(booking.startsAt, booking.endsAt);

            return (
              <div
                key={booking.id}
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#6B8F71] transition-all"
              >
                {/* Left side info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                    <img
                      src={booking.thumbnailUrl || "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=200"}
                      alt={booking.classTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
                        {booking.classTitle}
                      </h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs text-gray-500">
                      With {booking.instructor.name} • {booking.durationMin} mins • {booking.level}
                    </p>
                    <p className="text-xs font-semibold text-[#6B8F71]">
                      {formatDate(booking.startsAt, { weekday: "short", month: "short", day: "numeric" })} at{" "}
                      {formatTime(booking.startsAt)}
                    </p>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                  {/* Calendar Options (Upcoming only) */}
                  {activeTab === "upcoming" && (
                    <>
                      <a
                        href={getGoogleCalendarUrl(booking)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Add to Google Calendar"
                      >
                        <Calendar className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadIcs(booking)}
                        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Download .ics Calendar File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Join Room */}
                  {activeTab === "upcoming" &&
                    (joinAllowed ? (
                      <Link
                        href={booking.videoRoomUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#6B8F71] hover:bg-[#233D32] text-white shadow-md animate-pulse transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Live Room</span>
                      </Link>
                    ) : (
                      <span className="px-3 py-2 rounded-xl text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800">
                        Join opens 10m before start
                      </span>
                    ))}

                  {/* Cancel Button */}
                  {activeTab === "upcoming" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCancelBookingId(booking.id)}
                      className="rounded-xl px-3 py-2 text-xs font-medium text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50"
                    >
                      Cancel
                    </Button>
                  )}

                  {/* Rebook Button for Past/Cancelled */}
                  {(activeTab === "past" || activeTab === "cancelled") && (
                    <Link
                      href="/dashboard/schedule"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#233D32] hover:bg-[#6B8F71] text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Rebook Session</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onConfirm={() => cancelBookingId && cancelMutation.mutate(cancelBookingId)}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this booking? Free credit refunds apply when cancelled at least 2 hours before the start time."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        isDestructive={true}
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
