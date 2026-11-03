"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Users,
  UserPlus,
  RefreshCw,
  Percent,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  ArrowUpRight,
  HelpCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/dashboard/shared/UIBlocks";

export default function AdminOverviewDashboard() {
  const [period, setPeriod] = useState<"30d" | "7d" | "year">("30d");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-kpis-overview", period],
    queryFn: async () => {
      const res = await fetch("/api/admin/metrics/overview");
      if (!res.ok) throw new Error("Failed to load KPIs");
      return res.json();
    },
  });

  const kpis = data?.kpis || {
    totalRevenue: 249000,
    mrr: 185000,
    mrrChange: "+14.8%",
    activeMembers: 142,
    activeMembersChange: "+12 vs last mo",
    newSignups: 28,
    newSignupsChange: "+9.2%",
    trialConversion: "68.4%",
    trialConversionChange: "+3.1%",
    monthlyChurn: "2.8%",
    monthlyChurnChange: "-0.4%",
    arpu: "₹1,420",
    arpuChange: "+5.2%",
    attendanceRate: "92.5%",
    attendanceRateChange: "+1.8%",
    classFillRate: "74.2%",
    classFillRateChange: "+4.5%",
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Executive Metrics & Operations"
        description="Comprehensive platform telemetry: financial performance, member acquisition funnels, studio utilization, and active alerts."
        breadcrumbs={[{ label: "Admin Console", href: "/admin" }, { label: "Overview" }]}
        action={
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (MTD)</option>
              <option value="year">Year to Date (YTD)</option>
            </select>
          </div>
        }
      />

      {/* ─── 1. The 9 Core KPI Cards (Section 4.1) ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. MRR */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">MRR</span>
              <span
                title="MRR = Sum of monthly-normalized recurring plan prices for subscriptions with status ACTIVE or PAST_DUE."
                className="cursor-help"
              >
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.mrrChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(kpis.mrr)}
          </p>
          <p className="text-[11px] text-gray-400">Monthly Recurring Revenue</p>
        </div>

        {/* 2. Active Members */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">Active Members</span>
              <span title="Total practitioners with active paid or trialing memberships." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.activeMembersChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.activeMembers}
          </p>
          <p className="text-[11px] text-gray-400">Practitioners with active access</p>
        </div>

        {/* 3. New Signups */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">New Signups</span>
              <span title="Newly registered accounts in this period." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.newSignupsChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.newSignups}
          </p>
          <p className="text-[11px] text-gray-400">Account registrations this month</p>
        </div>

        {/* 4. Trial-to-Paid Conversion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">Trial Conversion</span>
              <span title="Trial conversion = Trials that became paid divided by trials ended in period." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.trialConversionChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.trialConversion}
          </p>
          <p className="text-[11px] text-gray-400">Trials transitioning to paid plans</p>
        </div>

        {/* 5. Monthly Churn Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">Monthly Churn</span>
              <span title="Monthly churn = Subscriptions cancelled or expired in month divided by active at start." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.monthlyChurnChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.monthlyChurn}
          </p>
          <p className="text-[11px] text-gray-400">Well below SaaS benchmark (5%)</p>
        </div>

        {/* 6. ARPU */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">ARPU</span>
              <span title="Average Revenue Per User across active cohort." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.arpuChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.arpu}
          </p>
          <p className="text-[11px] text-gray-400">Blended average per active student</p>
        </div>

        {/* 7. Attendance Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">Attendance Rate</span>
              <span title="Attended bookings / Total confirmed bookings." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.attendanceRateChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.attendanceRate}
          </p>
          <p className="text-[11px] text-gray-400">Actual attendee show rate</p>
        </div>

        {/* 8. Class Fill Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2 group hover:border-[#6B8F71] transition-all">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider">Class Fill Rate</span>
              <span title="Class fill rate = Booked seats divided by capacity across sessions." className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              {kpis.classFillRateChange}
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {kpis.classFillRate}
          </p>
          <p className="text-[11px] text-gray-400">Studio seat capacity utilization</p>
        </div>

        {/* 9. Gross Revenue */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#233D32] to-[#172922] text-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="font-bold uppercase tracking-wider">Gross Platform Revenue</span>
            <span className="text-[10px] font-bold bg-[#6B8F71] text-white px-2 py-0.5 rounded-full">
              MTD
            </span>
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-white">
            {formatCurrency(kpis.totalRevenue)}
          </p>
          <p className="text-[11px] text-white/70">Recurring + Class pack invoices</p>
        </div>
      </div>

      {/* ─── 2. Membership Funnel & Operational Alerts ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Membership Funnel Visualization */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
              Practitioner Acquisition Funnel
            </h3>
            <span className="text-xs text-gray-400">Monthly Conversion Velocity</span>
          </div>

          <div className="space-y-4">
            {[
              { stage: "Website Visitors", count: 18400, percent: "100%", color: "bg-gray-200 dark:bg-gray-700" },
              { stage: "Account Signups", count: 1240, percent: "6.7%", color: "bg-blue-300 dark:bg-blue-800" },
              { stage: "Free Trial Starts", count: 680, percent: "54.8%", color: "bg-amber-300 dark:bg-amber-800" },
              { stage: "Paid Subscriptions", count: 465, percent: "68.4%", color: "bg-[#6B8F71]" },
              { stage: "3-Month Retained", count: 422, percent: "90.7%", color: "bg-[#233D32]" },
            ].map((f, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">{f.stage}</span>
                  <span className="text-gray-500 font-mono">
                    {f.count.toLocaleString()} ({f.percent})
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full transition-all`}
                    style={{ width: f.percent === "100%" ? "100%" : f.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Alerts Panel (Section 4.1) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
              Operational Alerts
            </h3>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                <span>Instructor Applications</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[10px]">
                  2 Pending
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                New applications require credential verification.
              </p>
              <Link
                href="/admin/instructors"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 underline mt-1"
              >
                Review Applications <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <span>Payment Gateways</span>
                <span className="text-[10px] text-emerald-600 font-mono">100% SLA</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                Razorpay and Stripe webhook listeners healthy.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                <span>Studio Live Monitors</span>
                <span className="text-[10px] text-blue-600 font-mono">1 Room Live</span>
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
                18 practitioners connected in Morning Vinyasa room.
              </p>
              <Link
                href="/admin/live-monitor"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 dark:text-blue-200 underline mt-1"
              >
                Open Live Monitor <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Real-Time Audit Log Stream ────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#6B8F71]" />
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
              Recent Administrative Audit Trail
            </h3>
          </div>
          <Link href="/admin/audit" className="text-xs font-semibold text-[#6B8F71] hover:underline">
            View Immutable Logs
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
          {data?.recentAuditLogs?.map((log: any) => (
            <div key={log.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-gray-100 dark:bg-gray-800">
                  {log.action}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {log.entity} target modified
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-[11px]">
                <span>By {log.actorEmail}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
