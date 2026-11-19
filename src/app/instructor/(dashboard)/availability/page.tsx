"use client";

import React, { useState } from "react";
import { Clock, Calendar, Plus, Check, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorAvailabilityPage() {
  const { toast } = useToast();
  const [acceptingClasses, setAcceptingClasses] = useState(true);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const weekdays = [
    { day: "Monday", time: "06:00 AM – 11:00 AM, 05:00 PM – 08:00 PM", active: true },
    { day: "Tuesday", time: "06:00 AM – 11:00 AM, 05:00 PM – 08:00 PM", active: true },
    { day: "Wednesday", time: "06:00 AM – 11:00 AM, 05:00 PM – 08:00 PM", active: true },
    { day: "Thursday", time: "06:00 AM – 11:00 AM, 05:00 PM – 08:00 PM", active: true },
    { day: "Friday", time: "06:00 AM – 12:00 PM", active: true },
    { day: "Saturday", time: "07:00 AM – 10:00 AM (Weekend Workshop)", active: true },
    { day: "Sunday", time: "Rest & Self-Practice Day", active: false },
  ];

  const handleRequestTimeOff = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Leave request submitted for administrative review.");
    setIsTimeOffModalOpen(false);
    setLeaveReason("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Scheduling Windows & Leave
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Availability & Time Off
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Define recurring teaching availability windows in your local timezone and request leave periods.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsTimeOffModalOpen(true)}
          className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Request Time Off
        </Button>
      </div>

      {/* Accepting Classes Toggle */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs flex items-center justify-between gap-4 font-figtree">
        <div>
          <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
            Accepting New Class Assignments
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            When paused, platform operations will not assign new recurring studio series to your schedule.
          </p>
        </div>
        <button
          onClick={() => {
            setAcceptingClasses(!acceptingClasses);
            toast.info(`Accepting new classes: ${!acceptingClasses ? "Active" : "Paused"}`);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            acceptingClasses
              ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs"
              : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
          }`}
        >
          {acceptingClasses ? "Active & Accepting" : "Paused"}
        </button>
      </div>

      {/* Weekly Schedule Windows */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4 font-figtree">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
          <h3 className="font-outfit font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--primary-sage)]" />
            Weekly Recurring Teaching Windows (Asia/Kolkata)
          </h3>
          <span className="text-[11px] text-[var(--text-subtle)]">Used for substitute matching</span>
        </div>

        <div className="space-y-2.5">
          {weekdays.map((item) => (
            <div
              key={item.day}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-[var(--text-primary)] w-28">{item.day}</span>
                <span className={`${item.active ? "text-[var(--text-primary)]" : "text-[var(--text-subtle)] italic"}`}>
                  {item.time}
                </span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.active ? "bg-[var(--sage-tint)] text-[var(--primary-sage)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                }`}
              >
                {item.active ? "Available" : "Off"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Time Off Modal */}
      {isTimeOffModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 space-y-5 border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 font-figtree">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                Request Leave / Time Off
              </h3>
              <button onClick={() => setIsTimeOffModalOpen(false)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestTimeOff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Reason / Note *</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Attending Advanced Vipassana Meditation Retreat..."
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-hairline)]">
                <Button variant="ghost" onClick={() => setIsTimeOffModalOpen(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs">
                  Submit Leave Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
