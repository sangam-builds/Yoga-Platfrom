"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Users,
  Play,
  AlertTriangle,
  X,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Radio,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorSchedulePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedIcs, setCopiedIcs] = useState(false);

  // Cancellation dialog state
  const [cancellingSession, setCancellingSession] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-sessions", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/instructor/sessions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load schedule");
      return res.json();
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await fetch(`/api/instructor/sessions/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel session");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Session cancelled and credits refunded.");
      queryClient.invalidateQueries({ queryKey: ["instructor-sessions"] });
      setCancellingSession(null);
      setCancelReason("");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const sessions = data?.sessions || [];

  const copyIcsFeed = () => {
    const icsUrl = `${window.location.origin}/api/instructor/calendar/feed.ics`;
    navigator.clipboard.writeText(icsUrl);
    setCopiedIcs(true);
    toast.success("Calendar .ics feed URL copied to clipboard!");
    setTimeout(() => setCopiedIcs(false), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LIVE":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Now
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 text-stone-600 font-semibold">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-50 text-red-700 font-semibold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 font-semibold">
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Studio Calendar & Roster
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Teaching Schedule
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            View upcoming yoga sessions, manage student bookings, and export sync feed.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={copyIcsFeed}
            className="text-xs gap-1.5 border-[#E9E2D0] bg-white text-stone-700"
          >
            {copiedIcs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
            {copiedIcs ? "Copied Feed URL" : "Subscribe (.ics Feed)"}
          </Button>
          <Link href="/instructor/classes">
            <Button size="sm" className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              New Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E9E2D0] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === "" ? "bg-[#233D32] text-white" : "text-stone-600 hover:bg-[#F8F7F2]"
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setStatusFilter("SCHEDULED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === "SCHEDULED" ? "bg-[#233D32] text-white" : "text-stone-600 hover:bg-[#F8F7F2]"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === "COMPLETED" ? "bg-[#233D32] text-white" : "text-stone-600 hover:bg-[#F8F7F2]"
            }`}
          >
            Past Completed
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
          <span>Total: <strong>{sessions.length}</strong> sessions</span>
        </div>
      </div>

      {/* Session List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-stone-100 animate-pulse rounded-2xl border border-[#E9E2D0]" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9E2D0] text-center space-y-3">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#233D32]">No Scheduled Sessions</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You don't have any sessions matching your filter. Use class definitions to schedule recurring dates.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: any) => {
            const startDate = new Date(session.startsAt);
            const dateStr = startDate.toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeStr = startDate.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={session.id}
                className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#6B8F71]/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F8F7F2] text-[#233D32] flex flex-col items-center justify-center border border-[#E9E2D0] shrink-0 font-mono">
                    <span className="text-[10px] text-stone-400 font-bold uppercase">
                      {startDate.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className="text-base font-bold text-[#233D32]">
                      {startDate.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(session.status)}
                      <span className="text-[10px] font-mono text-stone-400">
                        {dateStr} • {timeStr}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#233D32]">
                      {session.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-stone-600 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#6B8F71]" />
                        <strong>{session.bookedCount}</strong> / {session.capacity} Booked
                      </span>
                      {session.waitlistCount > 0 && (
                        <span className="text-amber-600 font-bold">
                          {session.waitlistCount} Waitlisted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  <Link href={`/instructor/attendance?session=${session.id}`}>
                    <Button size="sm" variant="outline" className="text-xs border-[#E9E2D0] hover:border-[#6B8F71]">
                      Roster & Attendance
                    </Button>
                  </Link>

                  {session.status !== "CANCELLED" && session.status !== "COMPLETED" && (
                    <>
                      <Link href={`/instructor/live?session=${session.id}`}>
                        <Button size="sm" className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5 shadow-xs">
                          <Play className="w-3 h-3 fill-current" />
                          Launch Room
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCancellingSession(session)}
                        className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        Cancel Session
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mandatory Cancellation Reason Dialog (Rules 2 & 5 of Spec) */}
      {cancellingSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-rose-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg text-[#233D32]">
                  Cancel Session
                </h3>
              </div>
              <button
                onClick={() => setCancellingSession(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <p>
                You are about to cancel <strong>{cancellingSession.title}</strong>.
              </p>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
                <p className="font-bold">Automatic side-effects will trigger:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>{cancellingSession.bookedCount} practitioner(s)</strong> will be notified immediately</li>
                  <li>All booking credits will be refunded automatically to their ledgers</li>
                  <li>The waitlist will be cleared</li>
                  <li>This action cannot be undone and is written to the audit log</li>
                </ul>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mandatory Cancellation Reason (shown to students) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Unforeseen illness or teacher emergency..."
                  className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D0]">
              <Button
                variant="ghost"
                onClick={() => setCancellingSession(null)}
                className="text-xs"
              >
                Keep Session
              </Button>
              <Button
                disabled={cancelReason.trim().length < 5 || cancelSessionMutation.isPending}
                onClick={() =>
                  cancelSessionMutation.mutate({
                    id: cancellingSession.id,
                    reason: cancelReason,
                  })
                }
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
              >
                {cancelSessionMutation.isPending ? "Cancelling..." : "Confirm Cancellation & Refund"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
