"use client";

import React, { useState } from "react";
import { Bell, Send, Mail, MessageSquare, Clock, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorNotificationsPage() {
  const { toast } = useToast();
  const [template, setTemplate] = useState("PROPS");
  const [messageText, setMessageText] = useState("Please bring 2 foam blocks and a strap for today's deep hip opening sequence.");

  const templates: Record<string, string> = {
    PROPS: "Please bring 2 foam blocks and a strap for today's deep hip opening sequence.",
    RUNNING_LATE: "Teacher is joining the video room in 3 minutes. Please settle into child's pose and connect to your breath.",
    ROOM_CHANGE: "Please note our studio broadcast has migrated to room 2 due to network optimization.",
  };

  const handleTemplateChange = (key: string) => {
    setTemplate(key);
    setMessageText(templates[key] || "");
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    toast.success("Announcement dispatched to all booked practitioners. (Student emails kept confidential)");
    setMessageText("");
  };

  const alerts = [
    {
      id: "a1",
      title: "Booking Milestone Achieved",
      body: "Morning Awakening Vinyasa has reached 90% capacity for tomorrow.",
      time: "2 hours ago",
      type: "SUCCESS",
    },
    {
      id: "a2",
      title: "New Student Review Posted",
      body: "Priya S. rated your class 5 stars: 'Incredible guidance and gentle breath cues...'",
      time: "5 hours ago",
      type: "INFO",
    },
    {
      id: "a3",
      title: "Attendance Dispute Resolved",
      body: "You accepted the attendance adjustment for Arjun V.",
      time: "Yesterday",
      type: "ALERT",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Broadcasts & Operational Alerts
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Announcements & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Send reminders to booked practitioners with platform templates and review system alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Composer (Page 10 of Spec) */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
          <div className="pb-2 border-b border-[#E9E2D0]">
            <h3 className="font-serif font-bold text-base text-[#233D32] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#6B8F71]" />
              Compose Class Announcement
            </h3>
            <p className="text-[11px] text-stone-500">Dispatches via in-app banner and push notification</p>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Quick Template
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleTemplateChange("PROPS")}
                  className={`px-3 py-1.5 rounded-xl font-medium border ${
                    template === "PROPS" ? "bg-[#6B8F71] text-white border-[#6B8F71]" : "border-stone-200 text-stone-600"
                  }`}
                >
                  Props Reminder
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange("RUNNING_LATE")}
                  className={`px-3 py-1.5 rounded-xl font-medium border ${
                    template === "RUNNING_LATE" ? "bg-[#6B8F71] text-white border-[#6B8F71]" : "border-stone-200 text-stone-600"
                  }`}
                >
                  Running Late (3m)
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange("ROOM_CHANGE")}
                  className={`px-3 py-1.5 rounded-xl font-medium border ${
                    template === "ROOM_CHANGE" ? "bg-[#6B8F71] text-white border-[#6B8F71]" : "border-stone-200 text-stone-600"
                  }`}
                >
                  Room Notice
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Announcement Body *
              </label>
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl text-xs focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F8F7F2] text-stone-600 text-[11px] border border-[#E9E2D0]">
              <strong>Privacy Protection:</strong> Sent via ZenFlow automated relay. Teacher never sees raw student email addresses, honoring student privacy opt-outs.
            </div>

            <Button
              type="submit"
              disabled={!messageText.trim()}
              className="w-full bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch to Booked Students
            </Button>
          </form>
        </div>

        {/* Operational Alerts Feed */}
        <div className="bg-white p-6 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
          <div className="pb-2 border-b border-[#E9E2D0]">
            <h3 className="font-serif font-bold text-base text-[#233D32] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6B8F71]" />
              Recent Studio Alerts
            </h3>
            <p className="text-[11px] text-stone-500">Automated teaching telemetry</p>
          </div>

          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>{a.title}</span>
                  <span className="text-[10px] font-mono text-stone-400">{a.time}</span>
                </div>
                <p className="text-stone-600 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
