"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Users,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorAttendancePage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialSessionId = searchParams.get("session") || "";
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"roster" | "disputes">("roster");
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId);
  const [searchStudent, setSearchStudent] = useState("");

  // Override dialog state
  const [overrideModal, setOverrideModal] = useState<{
    attendanceId: string;
    studentName: string;
    currentStatus: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState<"ATTENDED" | "LATE" | "MISSED" | "EXCUSED">("ATTENDED");
  const [overrideNote, setOverrideNote] = useState("");

  // Dispute response dialog state
  const [disputeModal, setDisputeModal] = useState<any | null>(null);
  const [disputeDecision, setDisputeDecision] = useState<"ACCEPT" | "DECLINE">("ACCEPT");
  const [disputeExplanation, setDisputeExplanation] = useState("");

  // Fetch all sessions to populate selector
  const { data: sessionsData } = useQuery({
    queryKey: ["instructor-sessions-dropdown"],
    queryFn: async () => {
      const res = await fetch("/api/instructor/sessions");
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
  });

  const sessions = sessionsData?.sessions || [];
  const currentSessionId = selectedSessionId || (sessions[0]?.id || "");

  // Fetch session roster
  const { data: rosterData, isLoading: rosterLoading } = useQuery({
    queryKey: ["instructor-session-roster", currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return { roster: [], session: null };
      const res = await fetch(`/api/instructor/sessions/${currentSessionId}/attendance`);
      if (!res.ok) throw new Error("Failed to load attendance roster");
      return res.json();
    },
    enabled: !!currentSessionId,
  });

  // Fetch dispute queue
  const { data: disputesData, isLoading: disputesLoading } = useQuery({
    queryKey: ["instructor-attendance-disputes"],
    queryFn: async () => {
      const res = await fetch("/api/instructor/disputes");
      if (!res.ok) throw new Error("Failed to load disputes");
      return res.json();
    },
  });

  // Override Mutation
  const overrideMutation = useMutation({
    mutationFn: async () => {
      if (!overrideModal) return;
      const res = await fetch(`/api/instructor/sessions/${currentSessionId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendanceId: overrideModal.attendanceId,
          newStatus,
          overrideNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to override attendance");
      return data;
    },
    onSuccess: () => {
      toast.success("Attendance status updated and audit logged.");
      queryClient.invalidateQueries({ queryKey: ["instructor-session-roster", currentSessionId] });
      setOverrideModal(null);
      setOverrideNote("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Dispute Mutation
  const disputeMutation = useMutation({
    mutationFn: async () => {
      if (!disputeModal) return;
      const res = await fetch(`/api/instructor/disputes/${disputeModal.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: disputeDecision,
          explanation: disputeExplanation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to respond to dispute");
      return data;
    },
    onSuccess: () => {
      toast.success("Dispute resolved successfully.");
      queryClient.invalidateQueries({ queryKey: ["instructor-attendance-disputes"] });
      setDisputeModal(null);
      setDisputeExplanation("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const roster = rosterData?.roster || [];
  const filteredRoster = roster.filter((r: any) =>
    r.name.toLowerCase().includes(searchStudent.toLowerCase())
  );
  const disputes = disputesData?.disputes || [];
  const pendingDisputes = disputes.filter((d: any) => d.status === "PENDING");

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Practitioner Verification & Roster
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Attendance & Disputes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Review auto-computed participant presence, record manual status overrides, and resolve student disputes.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border-subtle)] self-start sm:self-auto shadow-2xs font-figtree">
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "roster"
                ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            Roster & Overrides
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "disputes"
                ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Disputes</span>
            {pendingDisputes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] font-figtree font-bold">
                {pendingDisputes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "roster" ? (
        <div className="space-y-6">
          {/* Session Selector & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-2xs font-figtree">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">
                Select Session:
              </label>
              <select
                value={currentSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] outline-none cursor-pointer"
              >
                {sessions.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.title} — {new Date(s.startsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}{" "}
                    ({new Date(s.startsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search practitioner..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30"
              />
            </div>
          </div>

          {/* Roster Table */}
          {rosterLoading ? (
            <div className="h-64 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-hairline)] animate-pulse" />
          ) : filteredRoster.length === 0 ? (
            <div className="bg-[var(--bg-surface)] rounded-3xl p-12 border border-[var(--border-subtle)] text-center space-y-3 shadow-2xs">
              <Users className="w-10 h-10 text-[var(--text-subtle)] mx-auto" />
              <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">No Practitioners on Roster</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-figtree">
                No active bookings found for this selected session yet.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-figtree">
                  <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] border-b border-[var(--border-hairline)] font-outfit text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Health / Injury Note</th>
                      <th className="py-3 px-4">Minutes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-hairline)]">
                    {filteredRoster.map((item: any) => (
                      <tr key={item.bookingId} className="hover:bg-[var(--bg-elevated)]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center font-outfit font-bold text-xs">
                              {item.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">
                          {item.experienceLevel}
                        </td>
                        <td className="py-3 px-4">
                          {item.injuries ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] border border-[var(--accent-amber)]/30 text-[11px]">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[180px]">{item.injuries}</span>
                            </span>
                          ) : (
                            <span className="text-[var(--text-subtle)] text-[11px]">None reported</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                          {item.minutesAttended} min
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.attendanceStatus === "ATTENDED"
                                ? "bg-[var(--sage-tint)] text-[var(--primary-sage)]"
                                : item.attendanceStatus === "LATE"
                                ? "bg-[var(--accent-amber-tint)] text-[var(--accent-amber)]"
                                : item.attendanceStatus === "MISSED"
                                ? "bg-[var(--negative-rose-tint)] text-[var(--negative-rose)]"
                                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                            }`}
                          >
                            {item.attendanceStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setOverrideModal({
                                attendanceId: item.attendanceId,
                                studentName: item.name,
                                currentStatus: item.attendanceStatus,
                              })
                            }
                            className="text-xs text-[var(--primary-sage)] hover:bg-[var(--sage-tint)] font-semibold cursor-pointer"
                          >
                            Override
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Disputes Queue Tab (Section 5.6) */
        <div className="space-y-4">
          {disputesLoading ? (
            <div className="h-48 bg-[var(--bg-elevated)] rounded-2xl animate-pulse border border-[var(--border-hairline)]" />
          ) : disputes.length === 0 ? (
            <div className="bg-[var(--bg-surface)] rounded-3xl p-12 border border-[var(--border-subtle)] text-center space-y-3 shadow-2xs">
              <CheckCircle className="w-10 h-10 text-[var(--primary-sage)] mx-auto" />
              <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">No Disputes Pending</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-figtree">
                All student attendance records are verified. No disputes have been opened.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute: any) => (
                <div
                  key={dispute.id}
                  className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-3 font-figtree"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--text-primary)] font-outfit">{dispute.studentName}</span>
                      <span className="text-xs text-[var(--text-subtle)]">•</span>
                      <span className="text-xs text-[var(--text-muted)] font-semibold">{dispute.classTitle}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        dispute.status === "PENDING"
                          ? "bg-[var(--accent-amber-tint)] text-[var(--accent-amber)]"
                          : dispute.status === "RESOLVED"
                          ? "bg-[var(--sage-tint)] text-[var(--primary-sage)]"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs text-[var(--text-primary)] space-y-1">
                    <p className="font-semibold text-[var(--text-primary)]">Student Claim:</p>
                    <p className="italic text-[var(--text-muted)]">"{dispute.message}"</p>
                    <p className="text-[10px] text-[var(--text-subtle)] pt-1">
                      Recorded: {dispute.minutesAttended} min ({dispute.currentStatus})
                    </p>
                  </div>

                  {dispute.status === "PENDING" ? (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setDisputeModal(dispute);
                          setDisputeDecision("DECLINE");
                        }}
                        className="text-xs border-[var(--negative-rose)]/40 text-[var(--negative-rose)] hover:bg-[var(--negative-rose-tint)] cursor-pointer"
                      >
                        Decline Claim
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDisputeModal(dispute);
                          setDisputeDecision("ACCEPT");
                        }}
                        className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs"
                      >
                        Accept & Mark Attended
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] italic">
                      Response: "{dispute.response}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Attendance Override Modal (Audited!) */}
      {overrideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 space-y-5 border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 font-figtree">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                Override Attendance: {overrideModal.studentName}
              </h3>
              <button onClick={() => setOverrideModal(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Adjusted Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs outline-none cursor-pointer"
                >
                  <option value="ATTENDED">Attended (Full Credit)</option>
                  <option value="LATE">Late Arrival</option>
                  <option value="MISSED">Missed / No-Show</option>
                  <option value="EXCUSED">Excused Absence</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Mandatory Override Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="e.g. Practitioner experienced camera connectivity issue but verified verbal presence..."
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] text-[11px] border border-[var(--accent-amber)]/20">
                <strong>Audit Notice:</strong> Manual attendance adjustments recompute the student's streaks and milestone certificates, and are recorded to the security audit log.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-hairline)]">
              <Button variant="ghost" onClick={() => setOverrideModal(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                Cancel
              </Button>
              <Button
                disabled={overrideNote.trim().length < 4 || overrideMutation.isPending}
                onClick={() => overrideMutation.mutate()}
                className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs"
              >
                {overrideMutation.isPending ? "Saving..." : "Apply & Log Override"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Response Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 space-y-5 border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 font-figtree">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                Resolve Dispute: {disputeModal.studentName}
              </h3>
              <button onClick={() => setDisputeModal(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-[var(--text-primary)]">
                <span className="font-semibold block text-[var(--text-primary)]">Student Message:</span>
                "{disputeModal.message}"
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisputeDecision("ACCEPT")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      disputeDecision === "ACCEPT"
                        ? "bg-[var(--sage-tint)] border-[var(--primary-sage)] text-[var(--primary-sage)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    Accept Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisputeDecision("DECLINE")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      disputeDecision === "DECLINE"
                        ? "bg-[var(--negative-rose-tint)] border-[var(--negative-rose)] text-[var(--negative-rose)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    Decline Claim
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Explanation to Student *
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeExplanation}
                  onChange={(e) => setDisputeExplanation(e.target.value)}
                  placeholder="Provide feedback on why this decision was reached..."
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-hairline)]">
              <Button variant="ghost" onClick={() => setDisputeModal(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                Cancel
              </Button>
              <Button
                disabled={disputeExplanation.trim().length < 5 || disputeMutation.isPending}
                onClick={() => disputeMutation.mutate()}
                className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs"
              >
                {disputeMutation.isPending ? "Submitting..." : "Submit Decision"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
