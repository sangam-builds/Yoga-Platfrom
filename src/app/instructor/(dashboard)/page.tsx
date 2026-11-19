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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Teacher Operations Desk
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Namaste & Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Monitor today’s studio bookings, student rosters, and monthly teaching performance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/instructor/classes">
            <Button size="sm" className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 shadow-xs cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              New Class Series
            </Button>
          </Link>
          <Link href="/instructor/schedule">
            <Button size="sm" variant="outline" className="border-[var(--border-subtle)] text-xs gap-1.5 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              Add Single Session
            </Button>
          </Link>
          <Link href="/instructor/availability">
            <Button size="sm" variant="ghost" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] gap-1.5 cursor-pointer">
              <Clock className="w-3.5 h-3.5" />
              Request Time Off
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards (5.1: 5 core cards comparing with previous month) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Classes Taught */}
        <div className="bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Classes Taught</span>
            <div className="w-7 h-7 rounded-lg bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
              {kpis.classesTaught}
            </span>
            <span className="text-[11px] font-figtree text-[var(--primary-sage)] font-semibold">
              {kpis.classesTaughtChange}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">This calendar month</p>
        </div>

        {/* Total Students Taught */}
        <div className="bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Students Taught</span>
            <div className="w-7 h-7 rounded-lg bg-[var(--info-teal-tint)] text-[var(--info-teal)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
              {kpis.totalStudents}
            </span>
            <span className="text-[11px] font-figtree text-[var(--primary-sage)] font-semibold">
              {kpis.totalStudentsChange}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">Unique attendees</p>
        </div>

        {/* Attendance Rate */}
        <div className="bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Attendance Rate</span>
            <div className="w-7 h-7 rounded-lg bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
              {kpis.attendanceRate}
            </span>
            <span className="text-[11px] font-figtree text-[var(--primary-sage)] font-semibold">
              {kpis.attendanceRateChange}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">Completed vs Booked</p>
        </div>

        {/* Average Rating */}
        <div className="bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Average Rating</span>
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] flex items-center justify-center">
              <Star className="w-4 h-4 fill-[var(--accent-amber)]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
              {kpis.averageRating}
            </span>
            <span className="text-[11px] font-figtree text-[var(--text-subtle)]">
              ({kpis.ratingCount} reviews)
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">Verified student reviews</p>
        </div>

        {/* Earnings This Month */}
        <div className="col-span-2 lg:col-span-1 bg-[var(--primary-sage)] text-[var(--on-primary)] p-4 sm:p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--on-primary)]/80">
            <span className="text-xs font-figtree font-medium">Month Earnings</span>
            <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-outfit text-2xl font-bold text-[var(--on-primary)]">
              {formatCurrency(kpis.estimatedEarnings)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--on-primary)]/80 font-figtree">
            <span>{kpis.revenueSharePercent}% RevShare</span>
            <span className="font-semibold text-white">{kpis.earningsChange}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Panel & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Teaching Sessions (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--primary-sage)]" />
              <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">
                Today’s Live Schedule
              </h3>
            </div>
            <Link
              href="/instructor/schedule"
              className="text-xs text-[var(--primary-sage)] hover:underline font-semibold flex items-center gap-1 font-figtree"
            >
              Full Calendar <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todaySessions.length === 0 ? (
            <div className="bg-[var(--bg-surface)] rounded-2xl p-8 border border-[var(--border-subtle)] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-outfit font-semibold text-[var(--text-primary)]">No Sessions Today</h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-figtree">
                Enjoy your practice or review your lesson plans for upcoming scheduled series.
              </p>
              <Link href="/instructor/schedule">
                <Button size="sm" variant="outline" className="text-xs border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
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
                    className="bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--primary-sage)]/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] flex flex-col items-center justify-center border border-[var(--border-hairline)] shrink-0 font-outfit">
                        <span className="text-[10px] text-[var(--text-subtle)] font-bold uppercase">Time</span>
                        <span className="text-xs font-bold">{startTime.split(" ")[0]}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-figtree px-2 py-0.5 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] font-semibold uppercase">
                            {session.style} • {session.level}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-figtree">
                            {startTime} – {endTime}
                          </span>
                        </div>
                        <h4 className="font-outfit font-bold text-base text-[var(--text-primary)] mt-0.5">
                          {session.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-figtree">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                            <strong className="text-[var(--text-primary)]">{session.bookedCount}</strong> / {session.capacity} Booked
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/instructor/attendance?session=${session.id}`}>
                        <Button size="sm" variant="outline" className="text-xs border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                          View Roster
                        </Button>
                      </Link>
                      <Link href={`/instructor/live?session=${session.id}`}>
                        <Button size="sm" className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 shadow-xs cursor-pointer">
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
          <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-outfit font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--primary-sage)]" />
                7-Day Booking Fill Forecast
              </h4>
              <span className="text-[11px] text-[var(--text-subtle)] font-figtree">Real-time attendance fill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {upcomingWeek.slice(0, 4).map((s: any) => (
                <div key={s.id} className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="font-figtree font-semibold text-[var(--text-primary)]">
                      {new Date(s.startsAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
                    </span>
                    <span className={`font-figtree text-[10px] font-bold ${s.fillPercentage < 40 ? "text-[var(--accent-amber)]" : "text-[var(--primary-sage)]"}`}>
                      {s.fillPercentage}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] truncate font-figtree">{s.title}</p>
                  <div className="w-full h-1.5 bg-[var(--border-subtle)]/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.fillPercentage < 40 ? "bg-[var(--accent-amber)]" : "bg-[var(--primary-sage)]"}`}
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
          <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4">
            <h3 className="font-outfit font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--accent-amber)]" />
              Action Items Requiring Attention
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/instructor/attendance"
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent-amber-tint)]/60 border border-[var(--border-hairline)] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-figtree">
                  <MessageSquare className="w-4 h-4 text-[var(--accent-amber)]" />
                  <span>Pending Attendance Disputes</span>
                </div>
                <span className="text-xs font-figtree font-bold px-2 py-0.5 rounded-full bg-[var(--accent-amber-tint)] text-[var(--accent-amber)]">
                  {actionItems.pendingDisputes}
                </span>
              </Link>

              <Link
                href="/instructor/availability"
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--info-teal-tint)]/60 border border-[var(--border-hairline)] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-figtree">
                  <Users className="w-4 h-4 text-[var(--info-teal)]" />
                  <span>Substitute Cover Requests</span>
                </div>
                <span className="text-xs font-figtree font-bold px-2 py-0.5 rounded-full bg-[var(--info-teal-tint)] text-[var(--info-teal)]">
                  {actionItems.pendingSubstitutes}
                </span>
              </Link>

              <Link
                href="/instructor/recordings"
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--sage-tint)]/60 border border-[var(--border-hairline)] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-figtree">
                  <Radio className="w-4 h-4 text-[var(--primary-sage)]" />
                  <span>Recordings Awaiting Confirmation</span>
                </div>
                <span className="text-xs font-figtree font-bold px-2 py-0.5 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)]">
                  {actionItems.recordingsToReview}
                </span>
              </Link>

              <Link
                href="/instructor/earnings"
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-surface)] border border-[var(--border-hairline)] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-xs text-[var(--text-primary)] font-figtree">
                  <DollarSign className="w-4 h-4 text-[var(--primary-sage)]" />
                  <span>Next Monthly Payout Review</span>
                </div>
                <span className="text-[11px] font-figtree text-[var(--text-muted)]">1st of Month</span>
              </Link>
            </div>
          </div>

          {/* Recent Reviews & Quick Reply */}
          <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Star className="w-4 h-4 text-[var(--accent-amber)] fill-[var(--accent-amber)]" />
                Latest Practitioner Reviews
              </h3>
              <Link href="/instructor/reviews" className="text-xs text-[var(--primary-sage)] hover:underline font-semibold font-figtree">
                View All
              </Link>
            </div>

            {recentReviews.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic font-figtree">No reviews received yet this week.</p>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((rev: any) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-1.5 text-xs font-figtree">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--text-primary)]">{rev.studentName}</span>
                      <div className="flex items-center gap-1 text-[var(--accent-amber)]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[var(--text-muted)] italic line-clamp-2">"{rev.comment}"</p>
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-hairline)] text-[10px] text-[var(--text-subtle)]">
                      <span>{rev.className}</span>
                      <Link href={`/instructor/reviews?reply=${rev.id}`} className="text-[var(--primary-sage)] font-semibold hover:underline">
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

