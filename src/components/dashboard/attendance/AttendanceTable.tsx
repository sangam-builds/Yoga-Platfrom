"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Pill } from "@/components/dashboard/ui/Pill";
import { TableSkeleton } from "@/components/dashboard/ui/Skeletons";
import { EmptyState } from "@/components/dashboard/ui/EmptyState";
import { useToast } from "@/components/dashboard/shared/Toast";
import type { AttendanceRecord } from "@/lib/hooks/dashboard/useAttendanceData";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
  selectedDate?: string | null;
  onClearDateFilter?: () => void;
}

export function AttendanceTable({
  records,
  isLoading,
  selectedDate,
  onClearDateFilter,
}: AttendanceTableProps) {
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [styleFilter, setStyleFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Dispute / Report issue modal state
  const [reportingRecord, setReportingRecord] = useState<AttendanceRecord | null>(null);
  const [issueReason, setIssueReason] = useState("I was present but marked absent");
  const [issueNotes, setIssueNotes] = useState("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // Extract unique styles for filter dropdown
  const uniqueStyles = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.style && set.add(r.style));
    return Array.from(set);
  }, [records]);

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        // Heatmap / calendar selected date filter
        if (selectedDate && !r.date.startsWith(selectedDate)) {
          return false;
        }
        // Status filter
        if (statusFilter !== "ALL" && r.status !== statusFilter) {
          return false;
        }
        // Style filter
        if (styleFilter !== "ALL" && r.style !== styleFilter) {
          return false;
        }
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = r.classTitle.toLowerCase().includes(q);
          const matchInstructor = r.instructorName.toLowerCase().includes(q);
          if (!matchTitle && !matchInstructor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [records, selectedDate, statusFilter, styleFilter, search, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingRecord) return;

    setIsSubmittingIssue(true);
    setTimeout(() => {
      setIsSubmittingIssue(false);
      setReportingRecord(null);
      setIssueNotes("");
      toast.success(
        "Dispute Submitted",
        `Your attendance query for "${reportingRecord.classTitle}" has been received by studio support.`
      );
    }, 400);
  };

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[20px] p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary-sage)]">
              PRACTICE ARCHIVE
            </span>
            <h3 className="font-outfit text-lg font-semibold text-[var(--text-primary)]">
              Session Log & History
            </h3>
          </div>

          {selectedDate && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] text-xs font-medium self-start sm:self-auto">
              <span>Filtered by {selectedDate}</span>
              <button
                type="button"
                onClick={onClearDateFilter}
                className="hover:opacity-75 transition-opacity"
                aria-label="Clear date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by class or instructor..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary-sage)] transition-colors"
            />
          </div>

          {/* Filter Dropdowns & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary-sage)] transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="ATTENDED">Attended</option>
              <option value="LATE">Late</option>
              <option value="MISSED">Missed</option>
              <option value="EXCUSED">Excused</option>
            </select>

            {/* Style Filter */}
            {uniqueStyles.length > 0 && (
              <select
                value={styleFilter}
                onChange={(e) => {
                  setStyleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by yoga style"
                className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary-sage)] transition-colors"
              >
                <option value="ALL">All Styles</option>
                {uniqueStyles.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Order */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {paginatedRecords.length === 0 ? (
        <div className="py-8">
          <EmptyState
            title="No sessions match criteria"
            description="Try clearing search filters or selecting another date on the calendar."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setStyleFilter("ALL");
                  onClearDateFilter?.();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary-sage)] text-white hover:opacity-90 transition-opacity"
              >
                Reset Filters
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Instructor</th>
                  <th className="py-3 px-3">Style</th>
                  <th className="py-3 px-3">Minutes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {paginatedRecords.map((r) => {
                  const d = new Date(r.date);
                  const formattedDate = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = d.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[var(--bg-canvas)]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-[var(--text-primary)]">{formattedDate}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{formattedTime}</div>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[var(--text-primary)]">
                        {r.classTitle}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] text-[10px] font-semibold flex items-center justify-center shrink-0">
                            {r.instructorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="text-[var(--text-primary)] font-medium">
                            {r.instructorName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-muted)]">
                          {r.style}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[var(--text-primary)] font-medium">
                        {r.minutes}m
                      </td>
                      <td className="py-3.5 px-3">
                        <Pill variant={r.status}>{r.status}</Pill>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setReportingRecord(r)}
                          className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--negative-rose)] transition-colors opacity-80 group-hover:opacity-100"
                        >
                          Report issue
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Cards View (<768px) */}
          <div className="md:hidden space-y-3 mt-3">
            {paginatedRecords.map((r) => {
              const d = new Date(r.date);
              const formattedDate = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/50 flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-xs text-[var(--text-primary)]">
                        {r.classTitle}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {formattedDate} • {r.minutes} min
                      </p>
                    </div>
                    <Pill variant={r.status}>{r.status}</Pill>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-sage)]" />
                      <span>{r.instructorName}</span>
                      <span>•</span>
                      <span>{r.style}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReportingRecord(r)}
                      className="text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--negative-rose)]"
                    >
                      Report issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            <div>
              Showing{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {Math.min(currentPage * pageSize, filteredRecords.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[var(--text-primary)]">
                {filteredRecords.length}
              </span>{" "}
              sessions
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-[var(--text-primary)]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Report Issue Modal */}
      {reportingRecord && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[20px] max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setReportingRecord(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--negative-rose)]/15 text-[var(--negative-rose)] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-semibold text-[var(--text-primary)]">
                  Report Attendance Issue
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {reportingRecord.classTitle} with {reportingRecord.instructorName}
                </p>
              </div>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Reason for dispute
                </label>
                <select
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary-sage)]"
                >
                  <option value="I was present but marked absent">
                    I attended the class but was marked absent
                  </option>
                  <option value="Instructor was absent or late">
                    Instructor arrived significantly late or was absent
                  </option>
                  <option value="Audio or video stream disconnected">
                    Video or stream disconnected during practice
                  </option>
                  <option value="Other discrepancy">Other discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="Explain what happened so our studio coordinator can review the logs..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary-sage)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReportingRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIssue}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary-sage)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSubmittingIssue ? "Submitting..." : "Submit Query"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
