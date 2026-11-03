"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  Clock,
  Radio,
  Plus,
  Play,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InstructorOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-overview"],
    queryFn: async () => {
      const res = await fetch("/api/instructor/overview");
      if (!res.ok) throw new Error("Failed to load overview data");
      return res.json();
    },
  });

  const kpis = data?.kpis || {
    classesTaught: 14,
    classesTaughtChange: "+3 vs last mo",
    totalStudents: 68,
    totalStudentsChange: "+12.4%",
    attendanceRate: "93.4%",
    attendanceRateChange: "+2.1%",
    averageRating: "4.9",
    ratingCount: 42,
    estimatedEarnings: 38500,
    earningsChange: "+15.2%",
    revenueSharePercent: 50,
  };

  const todaySessions = data?.todaySessions || [];
  const upcomingWeek = data?.upcomingWeek || [];
  const recentReviews = data?.recentReviews || [];
  const actionItems = data?.actionItems || {
    pendingDisputes: 0,
    pendingSubstitutes: 0,
    recordingsToReview: 1,
    missingNotesCount: 2,
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Teacher Operations Desk
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Namaste & Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Monitor today’s studio bookings, student rosters, and monthly teaching performance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/instructor/classes">
            <Button size="sm" className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              New Class Series
            </Button>
          </Link>
          <Link href="/instructor/schedule">
            <Button size="sm" variant="outline" className="border-[#E9E2D0] text-xs gap-1.5 bg-white">
              <Calendar className="w-3.5 h-3.5 text-stone-600" />
              Add Single Session
            </Button>
          </Link>
          <Link href="/instructor/availability">
            <Button size="sm" variant="ghost" className="text-xs text-stone-600 gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Request Time Off
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards (5.1: 5 core cards comparing with previous month) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Classes Taught */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Classes Taught</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#6B8F71] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#233D32]">
              {kpis.classesTaught}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">
              {kpis.classesTaughtChange}
            </span>
          </div>
          <p className="text-[10px] text-stone-400">This calendar month</p>
        </div>

        {/* Total Students Taught */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Students Taught</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#233D32]">
              {kpis.totalStudents}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">
              {kpis.totalStudentsChange}
            </span>
          </div>
          <p className="text-[10px] text-stone-400">Unique attendees</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Attendance Rate</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#233D32]">
              {kpis.attendanceRate}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">
              {kpis.attendanceRateChange}
            </span>
          </div>
          <p className="text-[10px] text-stone-400">Completed vs Booked</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium">Average Rating</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-[#233D32]">
              {kpis.averageRating}
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              ({kpis.ratingCount} reviews)
            </span>
          </div>
          <p className="text-[10px] text-stone-400">Verified student reviews</p>
        </div>

        {/* Earnings This Month */}
        <div className="col-span-2 lg:col-span-1 bg-[#233D32] text-white p-4 sm:p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#A8C2AC]">
            <span className="text-xs font-medium">Month Earnings</span>
            <div className="w-7 h-7 rounded-lg bg-white/10 text-amber-300 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-bold text-white">
              {formatCurrency(kpis.estimatedEarnings)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#A8C2AC]">
            <span>{kpis.revenueSharePercent}% RevShare</span>
            <span className="text-emerald-300 font-mono font-semibold">{kpis.earningsChange}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Panel & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Sessions (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="font-serif font-bold text-lg text-[#233D32]">
                Today’s Live Schedule
              </h3>
            </div>
            <Link
              href="/instructor/schedule"
              className="text-xs text-[#6B8F71] hover:underline font-semibold flex items-center gap-1"
            >
              Full Calendar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaySessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-[#E9E2D0] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] text-[#6B8F71] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-semibold text-stone-800">No Sessions Today</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Enjoy your practice or review your lesson plans for upcoming scheduled series.
              </p>
              <Link href="/instructor/schedule">
                <Button size="sm" variant="outline" className="text-xs">
                  Schedule a Special Session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session: any) => {
                const startTime = new Date(session.startsAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const endTime = new Date(session.endsAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={session.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E2D0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#6B8F71]/40 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#F8F7F2] text-[#233D32] flex flex-col items-center justify-center border border-[#E9E2D0] shrink-0 font-mono">
                        <span className="text-[10px] text-stone-400 font-bold uppercase">Time</span>
                        <span className="text-xs font-bold">{startTime.split(" ")[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6B8F71]/10 text-[#6B8F71] font-semibold uppercase">
                            {session.style} • {session.level}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">
                            {startTime} – {endTime}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#233D32] mt-0.5">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#6B8F71]" />
                            <strong>{session.bookedCount}</strong> / {session.capacity} Booked
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/instructor/attendance?session=${session.id}`}>
                        <Button size="sm" variant="outline" className="text-xs border-[#E9E2D0]">
                          View Roster
                        </Button>
                      </Link>
                      <Link href={`/instructor/live?session=${session.id}`}>
                        <Button size="sm" className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5 shadow-xs">
                          <Play className="w-3 h-3 fill-current" />
                          Launch Room
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Seven-Day Upcoming Week Strip (Page 5) */}
          <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-[#233D32] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#6B8F71]" />
                7-Day Booking Fill Forecast
              </h4>
              <span className="text-[11px] text-stone-400 font-mono">Real-time attendance fill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {upcomingWeek.slice(0, 4).map((s: any) => (
                <div key={s.id} className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-mono font-semibold">
                      {new Date(s.startsAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                    </span>
                    <span className={`font-mono text-[10px] font-bold ${s.fillPercentage < 40 ? "text-amber-600" : "text-emerald-600"}`}>
                      {s.fillPercentage}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#233D32] truncate">{s.title}</p>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.fillPercentage < 40 ? "bg-amber-500" : "bg-[#6B8F71]"}`}
                      style={{ width: `${Math.min(100, s.fillPercentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Action Items & Recent Reviews (1 Column) */}
        <div className="space-y-6">
          {/* Action Items Panel (Page 5 of Spec) */}
          <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#233D32] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Action Items Requiring Attention
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/instructor/attendance"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] hover:bg-amber-50/50 border border-[#E9E2D0] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  <span>Pending Attendance Disputes</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {actionItems.pendingDisputes}
                </span>
              </Link>

              <Link
                href="/instructor/availability"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] hover:bg-blue-50/50 border border-[#E9E2D0] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Substitute Cover Requests</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {actionItems.pendingSubstitutes}
                </span>
              </Link>

              <Link
                href="/instructor/recordings"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] hover:bg-emerald-50/50 border border-[#E9E2D0] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <Radio className="w-4 h-4 text-[#6B8F71]" />
                  <span>Recordings Awaiting Confirmation</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#233D32]">
                  {actionItems.recordingsToReview}
                </span>
              </Link>

              <Link
                href="/instructor/earnings"
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] hover:bg-stone-100 border border-[#E9E2D0] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Next Monthly Payout Review</span>
                </div>
                <span className="text-[10px] font-mono text-stone-500">1st of Month</span>
              </Link>
            </div>
          </div>

          {/* Recent Reviews & Quick Reply */}
          <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#233D32] flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Latest Practitioner Reviews
              </h3>
              <Link href="/instructor/reviews" className="text-xs text-[#6B8F71] hover:underline font-semibold">
                View All
              </Link>
            </div>

            {recentReviews.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No reviews received yet this week.</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((rev: any) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#233D32]">{rev.studentName}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 italic line-clamp-2">"{rev.comment}"</p>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[10px] text-stone-400">
                      <span>{rev.className}</span>
                      <Link href={`/instructor/reviews?reply=${rev.id}`} className="text-[#6B8F71] font-semibold hover:underline">
                        {rev.hasReply ? "Replied ✓" : "Reply →"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

