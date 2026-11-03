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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Scheduling Windows & Leave
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Availability & Time Off
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Define recurring teaching availability windows in your local timezone and request leave periods.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsTimeOffModalOpen(true)}
          className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Request Time Off
        </Button>
      </div>

      {/* Accepting Classes Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-base text-[#233D32]">
            Accepting New Class Assignments
          </h3>
          <p className="text-xs text-stone-600">
            When paused, platform operations will not assign new recurring studio series to your schedule.
          </p>
        </div>
        <button
          onClick={() => {
            setAcceptingClasses(!acceptingClasses);
            toast.info(`Accepting new classes: ${!acceptingClasses ? "Active" : "Paused"}`);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            acceptingClasses
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-stone-200 text-stone-700"
          }`}
        >
          {acceptingClasses ? "Active & Accepting" : "Paused"}
        </button>
      </div>

      {/* Weekly Schedule Windows */}
      <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E9E2D0]">
          <h3 className="font-serif font-bold text-base text-[#233D32] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6B8F71]" />
            Weekly Recurring Teaching Windows (Asia/Kolkata)
          </h3>
          <span className="text-[11px] font-mono text-stone-400">Used for substitute matching</span>
        </div>

        <div className="space-y-2.5">
          {weekdays.map((item) => (
            <div
              key={item.day}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-stone-800 w-28">{item.day}</span>
                <span className={`font-mono ${item.active ? "text-stone-700" : "text-stone-400 italic"}`}>
                  {item.time}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  item.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E9E2D0] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]">
              <h3 className="font-serif font-bold text-base text-[#233D32]">
                Request Leave / Time Off
              </h3>
              <button onClick={() => setIsTimeOffModalOpen(false)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestTimeOff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Reason / Note *</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Attending Advanced Vipassana Meditation Retreat..."
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9E2D0]">
                <Button variant="ghost" onClick={() => setIsTimeOffModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B8F71] hover:bg-[#58775D] text-white">
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
