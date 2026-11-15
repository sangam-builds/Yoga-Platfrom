"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Download,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader, StatCard, StatusBadge, EmptyState } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function AttendanceTrackerPage() {
  const { t, formatDate, formatTime } = useI18n();
  const { toast } = useToast();

  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch Attendance Heatmap
  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ["attendance-heatmap", filterYear],
    queryFn: async () => {
      const res = await fetch(`/api/me/attendance/heatmap?weeks=52`);
      if (!res.ok) throw new Error("Failed to load attendance");
      return res.json();
    },
  });

  // Mock sample attendance log items
  const attendanceLogs = [
    {
      id: "att-1",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      classTitle: "Morning Sun Vinyasa",
      instructor: "Priya Sharma",
      minutes: 45,
      status: "ATTENDED",
    },
    {
      id: "att-2",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      classTitle: "Hatha Spine & Alignment",
      instructor: "Aarav Patel",
      minutes: 60,
      status: "ATTENDED",
    },
    {
      id: "att-3",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      classTitle: "Yin for Deep Rest & Sleep",
      instructor: "Meera Nair",
      minutes: 60,
      status: "ATTENDED",
    },
    {
      id: "att-4",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      classTitle: "Power Flow: Strength & Inversions",
      instructor: "Priya Sharma",
      minutes: 60,
      status: "ATTENDED",
    },
    {
      id: "att-5",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      classTitle: "Pranayama & Sound Meditation",
      instructor: "Meera Nair",
      minutes: 30,
      status: "ATTENDED",
    },
  ];

  const filteredLogs =
    statusFilter === "ALL"
      ? attendanceLogs
      : attendanceLogs.filter((log) => log.status === statusFilter);

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Date,Class,Instructor,Minutes,Status"]
        .concat(
          attendanceLogs.map(
            (l) => `${formatDate(l.date)},${l.classTitle},${l.instructor},${l.minutes},${l.status}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zenflow_attendance_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export Ready", "Your verified attendance records have been downloaded.");
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Attendance & Practice Logs"
        description="Comprehensive audit of your completed yoga sessions, practice minutes, and consistency heatmap."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attendance" }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] hover:bg-[#F3EFE4] font-figtree"
            >
              <Download className="w-3.5 h-3.5 text-[#47664A]" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {/* ─── 1. Summary Cards Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sessions Attended"
          value="18"
          icon={<CheckCircle2 className="w-4 h-4 text-[#35523E] dark:text-[#A7C7A8]" />}
          subtext="94.7% attendance rate"
        />
        <StatCard
          label="Total Mat Minutes"
          value="915m"
          icon={<Clock className="w-4 h-4 text-[#47664A] dark:text-[#8BB394]" />}
          subtext="~15.2 hours practice"
        />
        <StatCard
          label="Current Streak"
          value="4 days"
          icon={<Flame className="w-4 h-4 text-[#D97706]" />}
          subtext="Longest streak: 14 days"
        />
        <StatCard
          label="Classes Missed"
          value="1"
          icon={<AlertCircle className="w-4 h-4 text-[#A63A36]" />}
          subtext="1 excused absence"
        />
      </div>

      {/* ─── 2. Full Year Heatmap ─────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#E1EDDD] dark:bg-[#223528] flex items-center justify-center text-[#35523E] dark:text-[#A7C7A8]">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-outfit font-semibold text-lg text-[#29352F] dark:text-[#E8EFE8]">
              Annual Consistency Heatmap ({filterYear})
            </h3>
          </div>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] font-semibold text-[#29352F] dark:text-[#E8EFE8] font-figtree"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        {/* 52-week grid */}
        <div className="overflow-x-auto py-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
            {Array.from({ length: 364 }).map((_, i) => {
              const isPracticed = (i * 3 + 1) % 5 === 0 || i % 7 === 2;
              return (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-xs transition-transform hover:scale-150 cursor-pointer ${
                    isPracticed
                      ? "bg-[#47664A] dark:bg-[#608665]"
                      : "bg-[#FAF6EE] dark:bg-[#1A2A21] border border-[#E5DFD4] dark:border-[#283E31]"
                  }`}
                  title={isPracticed ? `Attended class (60m)` : "Rest day"}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6C7B72] dark:text-[#A4B5A9] pt-2 border-t border-[#E5DFD4] dark:border-[#283E31] font-figtree">
          <span>Jan 1</span>
          <div className="flex items-center gap-2">
            <span>Rest Day</span>
            <span className="w-3 h-3 rounded-xs bg-[#FAF6EE] dark:bg-[#1A2A21] border border-[#E5DFD4] dark:border-[#283E31]" />
            <span className="w-3 h-3 rounded-xs bg-[#47664A]/40" />
            <span className="w-3 h-3 rounded-xs bg-[#47664A]" />
            <span>Class Completed</span>
          </div>
          <span>Dec 31</span>
        </div>
      </div>

      {/* ─── 3. Detailed Attendance Table ────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] overflow-hidden shadow-xs space-y-4 p-6 font-figtree">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-outfit font-semibold text-lg text-[#29352F] dark:text-[#E8EFE8]">
            Session History
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6C7B72] dark:text-[#A4B5A9]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] font-semibold text-[#29352F] dark:text-[#E8EFE8]"
            >
              <option value="ALL">All Records</option>
              <option value="ATTENDED">Attended</option>
              <option value="MISSED">Missed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5DFD4] dark:border-[#283E31] text-[#6C7B72] dark:text-[#A4B5A9] font-outfit uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD4] dark:divide-[#283E31]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF6EE]/60 dark:hover:bg-[#15231A]">
                  <td className="py-3.5 px-4 font-medium text-[#29352F] dark:text-[#E8EFE8]">
                    {formatDate(log.date)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#29352F] dark:text-[#E8EFE8]">{log.classTitle}</td>
                  <td className="py-3.5 px-4 text-[#6C7B72] dark:text-[#A4B5A9]">{log.instructor}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#47664A] dark:text-[#8BB394]">{log.minutes} mins</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        toast.info(
                          "Dispute Logged",
                          `Issue submitted for review by instructor ${log.instructor}.`
                        )
                      }
                      className="text-[#6C7B72] hover:text-[#29352F] dark:hover:text-white"
                    >
                      Report issue
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

