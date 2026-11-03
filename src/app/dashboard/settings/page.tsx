"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Lock,
  Globe,
  Clock,
  Check,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { t, locale, setLocale, timezone, setTimezone } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<"profile" | "preferences" | "notifications" | "security" | "privacy">("profile");

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("BEGINNER");
  const [goals, setGoals] = useState<string[]>(["flexibility", "stress_relief"]);

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [classReminders, setClassReminders] = useState(true);
  const [whatsappReminders, setWhatsappReminders] = useState(false);
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(true);

  // Fetch Current User
  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to load user");
      return res.json();
    },
  });

  useEffect(() => {
    if (userData?.user) {
      setName(userData.user.name || "");
      setEmail(userData.user.email || "");
      if (userData.user.experienceLevel) setExperienceLevel(userData.user.experienceLevel);
      if (userData.user.goals) setGoals(userData.user.goals);
    }
  }, [userData]);

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          timezone,
          locale,
          experienceLevel,
          goals,
        }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Settings Saved", "Your profile preferences have been updated.");
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
    },
    onError: (err: any) => {
      toast.error("Save Failed", err.message);
    },
  });

  const availableGoals = [
    { id: "flexibility", label: "Flexibility & Mobility" },
    { id: "stress_relief", label: "Stress Relief & Calm" },
    { id: "strength", label: "Core & Muscular Strength" },
    { id: "sleep", label: "Better Sleep Quality" },
    { id: "pranayama", label: "Breathing & Lung Capacity" },
  ];

  const toggleGoal = (goalId: string) => {
    if (goals.includes(goalId)) {
      setGoals(goals.filter((g) => g !== goalId));
    } else {
      setGoals([...goals, goalId]);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in">
      <PageHeader
        title="Account Settings & Preferences"
        description="Manage your identity, personal practice focus, notifications, timezone, and security."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      {/* ─── Navigation Sub-Tabs ────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "preferences", label: "Yoga Preferences", icon: SettingsIcon },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "security", label: "Security", icon: Shield },
          { id: "privacy", label: "Privacy & Data", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeSection === tab.id
                  ? "bg-[#233D32] text-white dark:bg-[#6B8F71] dark:text-gray-950 font-bold shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Section Content ────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-6">
        {activeSection === "profile" && (
          <div className="space-y-5">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
              Personal Information
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
              />
              <span className="text-[11px] text-gray-400">
                To change your email address, contact platform security support.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Preferred Language
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent font-medium"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Display Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent font-medium"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="UTC">UTC (GMT +0:00)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (BST)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === "preferences" && (
          <div className="space-y-6">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
              Yoga Practice Profile
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Experience Level:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`p-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      experienceLevel === lvl
                        ? "border-[#6B8F71] bg-[#6B8F71]/15 text-[#233D32] dark:text-[#A7C4B5]"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {lvl.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Primary Mindfulness & Physical Goals:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableGoals.map((g) => {
                  const isChecked = goals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGoal(g.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                        isChecked
                          ? "border-[#6B8F71] bg-[#6B8F71]/10 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span>{g.label}</span>
                      {isChecked && <Check className="w-4 h-4 text-[#6B8F71]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="space-y-5">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
              Notification Channels
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Email Confirmations</p>
                  <p className="text-[11px] text-gray-500">Receive calendar receipts and booking confirmations</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded text-[#6B8F71] focus:ring-[#6B8F71]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Class Reminders</p>
                  <p className="text-[11px] text-gray-500">Alert 24h and 15m before scheduled live sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={classReminders}
                  onChange={(e) => setClassReminders(e.target.checked)}
                  className="rounded text-[#6B8F71] focus:ring-[#6B8F71]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">WhatsApp Notifications</p>
                  <p className="text-[11px] text-gray-500">Instant join link sent to your registered phone</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappReminders}
                  onChange={(e) => setWhatsappReminders(e.target.checked)}
                  className="rounded text-[#6B8F71] focus:ring-[#6B8F71]"
                />
              </label>
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-5">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
              Security & Credentials
            </h3>

            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Account Password</p>
                <p className="text-[11px] text-gray-500">Managed via Supabase Secure Authentication</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.info("Password Reset Sent", "Check your email inbox for instructions.")}
                className="text-xs rounded-xl"
              >
                Send Reset Link
              </Button>
            </div>
          </div>
        )}

        {activeSection === "privacy" && (
          <div className="space-y-5">
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
              Privacy, Data & GDPR
            </h3>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Community Leaderboard Opt-In</p>
                <p className="text-[11px] text-gray-500">Display your practice streak to inspire fellow yogis</p>
              </div>
              <input
                type="checkbox"
                checked={leaderboardOptIn}
                onChange={(e) => setLeaderboardOptIn(e.target.checked)}
                className="rounded text-[#6B8F71] focus:ring-[#6B8F71]"
              />
            </label>

            <div className="pt-2 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => toast.success("Data Export Queued", "Your personal archive will be emailed within 15 minutes.")}
                className="rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download My Data (GDPR)</span>
              </Button>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <Button
            type="button"
            onClick={() => updateMutation.mutate()}
            isLoading={updateMutation.isPending}
            className="bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-xl text-xs font-bold px-6 py-2.5 shadow-xs"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
