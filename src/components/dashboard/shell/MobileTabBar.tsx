"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookmarkCheck,
  CheckCircle2,
  MoreHorizontal,
  CreditCard,
  Award,
  Video,
  BookOpen,
  Sparkles,
  Bot,
  Settings,
  X,
  Lock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface MobileTabBarProps {
  hasActivePlan?: boolean;
  todayBookingsCount?: number;
}

export function MobileTabBar({
  hasActivePlan = false,
  todayBookingsCount = 0,
}: MobileTabBarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    {
      id: "overview",
      label: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "schedule",
      label: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      id: "bookings",
      label: "Bookings",
      href: "/dashboard/bookings",
      icon: BookmarkCheck,
      badge: todayBookingsCount > 0 ? todayBookingsCount : undefined,
    },
    {
      id: "attendance",
      label: "Attendance",
      href: "/dashboard/attendance",
      icon: CheckCircle2,
    },
  ];

  const moreItems = [
    {
      id: "membership",
      label: "Membership & Credits",
      href: "/dashboard/membership",
      icon: CreditCard,
    },
    {
      id: "certificates",
      label: "Certificates",
      href: "/dashboard/certificates",
      icon: Award,
    },
    {
      id: "recordings",
      label: "Class Recordings",
      href: "/dashboard/recordings",
      icon: Video,
      locked: !hasActivePlan,
    },
    {
      id: "journal",
      label: "Mindfulness Journal",
      href: "/dashboard/journal",
      icon: BookOpen,
    },
    {
      id: "poses",
      label: "Pose Library",
      href: "/dashboard/poses",
      icon: Sparkles,
    },
    {
      id: "assistant",
      label: "AI Wellness Assistant",
      href: "/dashboard/assistant",
      icon: Bot,
    },
    {
      id: "settings",
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isMoreActive = moreItems.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-hairline)] px-2 flex items-center justify-around select-none shadow-lg"
      >
        {mainTabs.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isActive
                  ? "text-[var(--primary-sage)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full text-[9px] font-bold bg-[var(--primary-sage)] text-[var(--on-primary)] leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          aria-expanded={isMoreOpen}
          aria-label="More navigation items"
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            isMoreActive || isMoreOpen
              ? "text-[var(--primary-sage)] font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* More Bottom Sheet */}
      {isMoreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="w-full bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)] mb-3">
              <span className="font-outfit font-bold text-base text-[var(--text-primary)]">
                More Sections
              </span>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-1">
              {moreItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-figtree transition-colors ${
                      isActive
                        ? "bg-[var(--sage-tint)] text-[var(--primary-sage)] font-semibold"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive
                            ? "bg-[var(--primary-sage)] text-[var(--on-primary)]"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>

                    {item.locked && (
                      <span className="flex items-center gap-1 text-xs text-[var(--text-subtle)]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Plan required</span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
