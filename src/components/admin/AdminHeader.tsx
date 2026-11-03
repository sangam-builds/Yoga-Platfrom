"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  ShieldCheck,
  Clock,
  RotateCcw,
  LogOut,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "@/lib/rbac/roles";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/Button";

export interface AdminHeaderProps {
  adminEmail: string;
  adminName: string;
  role: UserRole;
  subRole?: string;
}

export function AdminHeader({
  adminEmail,
  adminName,
  role,
  subRole = "SUPER_ADMIN",
}: AdminHeaderProps) {
  // Idle session countdown (15 minutes = 900 seconds)
  const [idleSeconds, setIdleSeconds] = useState(900);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdleSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resetIdleTimer = () => {
    setIdleSeconds(900);
  };

  const minutes = Math.floor(idleSeconds / 60);
  const seconds = idleSeconds % 60;

  return (
    <header className="h-16 border-b border-[#E9E2D0] dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Context & Environment */}
      <div className="flex items-center gap-3">
        <h2 className="text-sm sm:text-base font-serif font-bold text-[#233D32] dark:text-white">
          Admin Console
        </h2>

        {/* Environment Badge */}
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          Production
        </span>

        {/* Sub-Role Pill */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#233D32] text-white font-bold">
          {subRole}
        </span>

        {/* MFA Active Pill */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3 h-3" />
          <span>MFA Active</span>
        </span>
      </div>

      {/* Right side: Session timeout, alerts, user avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Session Idle Countdown Banner (Section 3) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-600 dark:text-gray-300 font-mono text-[11px]">
            Timeout: {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={resetIdleTimer}
            title="Reset session timeout"
            className="text-[#6B8F71] hover:underline font-semibold text-[11px] ml-1"
          >
            Stay Signed In
          </button>
        </div>

        {/* Operational Alerts Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
            aria-label="Operational alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {isAlertsOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 z-50 text-xs animate-in fade-in"
              onClick={() => setIsAlertsOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800 font-bold">
                <span>Operational Alerts (3)</span>
                <span className="text-[10px] text-gray-400">Real-time</span>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    2 Instructor Applications Pending
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    Review background & certifications in Instructor Queue.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Database & Video Rooms Healthy
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-0.5">
                    All webhooks responding within 120ms SLA.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Info & Logout */}
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-[#233D32] dark:text-white truncate max-w-[150px]">
            {adminName}
          </p>
          <p className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">
            {adminEmail}
          </p>
        </div>

        <LogoutButton variant="outline" className="text-xs py-1.5 px-3" />
      </div>
    </header>
  );
}
