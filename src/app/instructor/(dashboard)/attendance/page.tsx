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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Practitioner Verification & Roster
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Attendance & Disputes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Review auto-computed participant presence, record manual status overrides, and resolve student disputes.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-[#E9E2D0] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "roster"
                ? "bg-[#6B8F71] text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Roster & Overrides
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === "disputes"
                ? "bg-[#233D32] text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Disputes</span>
            {pendingDisputes.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono font-bold">
                {pendingDisputes.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "roster" ? (
        <div className="space-y-6">
          {/* Session Selector & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-2xl border border-[#E9E2D0] shadow-xs">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs font-semibold text-stone-600 whitespace-nowrap">
                Select Session:
              </label>
              <select
                value={currentSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-xs bg-[#F8F7F2] border border-[#E9E2D0] rounded-xl text-stone-800 font-medium focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
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
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                placeholder="Search practitioner..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F7F2] border border-[#E9E2D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30"
              />
            </div>
          </div>

          {/* Roster Table */}
          {rosterLoading ? (
            <div className="h-64 bg-stone-100 rounded-2xl border border-[#E9E2D0] animate-pulse" />
          ) : filteredRoster.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E9E2D0] text-center space-y-3">
              <Users className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[#233D32]">No Practitioners on Roster</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No active bookings found for this selected session yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E9E2D0] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F7F2] text-stone-600 border-b border-[#E9E2D0] font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Health / Injury Note</th>
                      <th className="py-3 px-4">Minutes</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E2D0]">
                    {filteredRoster.map((item: any) => (
                      <tr key={item.bookingId} className="hover:bg-[#F8F7F2]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#6B8F71]/20 text-[#233D32] flex items-center justify-center font-bold text-xs">
                              {item.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-stone-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-stone-600">
                          {item.experienceLevel}
                        </td>
                        <td className="py-3 px-4">
                          {item.injuries ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[180px]">{item.injuries}</span>
                            </span>
                          ) : (
                            <span className="text-stone-400 font-mono text-[11px]">None reported</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          {item.minutesAttended} min
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                              item.attendanceStatus === "ATTENDED"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.attendanceStatus === "LATE"
                                ? "bg-amber-50 text-amber-700"
                                : item.attendanceStatus === "MISSED"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-stone-100 text-stone-600"
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
                            className="text-xs text-[#6B8F71] hover:text-[#58775D] hover:bg-[#6B8F71]/10 font-semibold"
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
            <div className="h-48 bg-stone-100 rounded-2xl animate-pulse" />
          ) : disputes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-[#E9E2D0] text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[#233D32]">No Disputes Pending</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                All student attendance records are verified. No disputes have been opened.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute: any) => (
                <div
                  key={dispute.id}
                  className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#233D32]">{dispute.studentName}</span>
                      <span className="text-xs text-stone-400">•</span>
                      <span className="text-xs text-stone-600 font-semibold">{dispute.classTitle}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        dispute.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : dispute.status === "RESOLVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {dispute.status}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-xs text-stone-700 space-y-1">
                    <p className="font-semibold text-stone-800">Student Claim:</p>
                    <p className="italic">"{dispute.message}"</p>
                    <p className="text-[10px] text-stone-400 font-mono pt-1">
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
                        className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Decline Claim
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setDisputeModal(dispute);
                          setDisputeDecision("ACCEPT");
                        }}
                        className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs"
                      >
                        Accept & Mark Attended
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 italic">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E9E2D0] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]">
              <h3 className="font-serif font-bold text-base text-[#233D32]">
                Override Attendance: {overrideModal.studentName}
              </h3>
              <button onClick={() => setOverrideModal(null)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Adjusted Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl bg-white text-xs"
                >
                  <option value="ATTENDED">Attended (Full Credit)</option>
                  <option value="LATE">Late Arrival</option>
                  <option value="MISSED">Missed / No-Show</option>
                  <option value="EXCUSED">Excused Absence</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mandatory Override Justification *
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="e.g. Practitioner experienced camera connectivity issue but verified verbal presence..."
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 text-[11px] border border-amber-200">
                <strong>Audit Notice:</strong> Manual attendance adjustments recompute the student's streaks and milestone certificates, and are recorded to the security audit log.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D0]">
              <Button variant="ghost" onClick={() => setOverrideModal(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                disabled={overrideNote.trim().length < 4 || overrideMutation.isPending}
                onClick={() => overrideMutation.mutate()}
                className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E9E2D0] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]">
              <h3 className="font-serif font-bold text-base text-[#233D32]">
                Resolve Dispute: {disputeModal.studentName}
              </h3>
              <button onClick={() => setDisputeModal(null)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F7F2] text-stone-700">
                <span className="font-semibold block text-stone-900">Student Message:</span>
                "{disputeModal.message}"
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisputeDecision("ACCEPT")}
                    className={`py-2 px-3 rounded-xl font-bold border ${
                      disputeDecision === "ACCEPT"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    Accept Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisputeDecision("DECLINE")}
                    className={`py-2 px-3 rounded-xl font-bold border ${
                      disputeDecision === "DECLINE"
                        ? "bg-rose-50 border-rose-500 text-rose-800"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    Decline Claim
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Explanation to Student *
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeExplanation}
                  onChange={(e) => setDisputeExplanation(e.target.value)}
                  placeholder="Provide feedback on why this decision was reached..."
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D0]">
              <Button variant="ghost" onClick={() => setDisputeModal(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                disabled={disputeExplanation.trim().length < 5 || disputeMutation.isPending}
                onClick={() => disputeMutation.mutate()}
                className="bg-[#233D32] hover:bg-[#1a2f26] text-white text-xs"
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
