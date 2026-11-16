"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookmarkCheck,
  CreditCard,
  CheckCircle2,
  Award,
  Video,
  BookOpen,
  Sparkles,
  Bot,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export interface NavItemConfig {
  id: string;
  nameKey: string;
  defaultLabel: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  locked?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasActivePlan?: boolean;
  todayBookingsCount?: number;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  hasActivePlan = false,
  todayBookingsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems: NavItemConfig[] = [
    {
      id: "overview",
      nameKey: "nav.overview",
      defaultLabel: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "schedule",
      nameKey: "nav.schedule",
      defaultLabel: "Schedule",
      href: "/dashboard/schedule",
      icon: Calendar,
    },
    {
      id: "bookings",
      nameKey: "nav.bookings",
      defaultLabel: "My Bookings",
      href: "/dashboard/bookings",
      icon: BookmarkCheck,
      badge: todayBookingsCount > 0 ? todayBookingsCount : undefined,
    },
    {
      id: "membership",
      nameKey: "nav.membership",
      defaultLabel: "Membership",
      href: "/dashboard/membership",
      icon: CreditCard,
    },
    {
      id: "attendance",
      nameKey: "nav.attendance",
      defaultLabel: "Attendance",
      href: "/dashboard/attendance",
      icon: CheckCircle2,
    },
    {
      id: "certificates",
      nameKey: "nav.certificates",
      defaultLabel: "Certificates",
      href: "/dashboard/certificates",
      icon: Award,
    },
    {
      id: "recordings",
      nameKey: "nav.recordings",
      defaultLabel: "Recordings",
      href: "/dashboard/recordings",
      icon: Video,
      locked: !hasActivePlan,
    },
    {
      id: "journal",
      nameKey: "nav.journal",
      defaultLabel: "Journal",
      href: "/dashboard/journal",
      icon: BookOpen,
    },
    {
      id: "poses",
      nameKey: "nav.poses",
      defaultLabel: "Pose Library",
      href: "/dashboard/poses",
      icon: Sparkles,
    },
    {
      id: "assistant",
      nameKey: "nav.assistant",
      defaultLabel: "AI Assistant",
      href: "/dashboard/assistant",
      icon: Bot,
    },
    {
      id: "settings",
      nameKey: "nav.settings",
      defaultLabel: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-hairline)] transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-hairline)]">
        <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Leaf className="w-4 h-4 text-[var(--sage-tint-icon)] stroke-[2]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-outfit font-bold text-base text-[var(--text-primary)] tracking-tight leading-none truncate">
                ZenFlow
              </span>
              <span className="font-figtree text-[10px] tracking-[0.2em] font-semibold text-[var(--primary-sage)] uppercase mt-0.5">
                Yoga Studio
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex w-7 h-7 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] items-center justify-center transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const label = t(item.nameKey) || item.defaultLabel;

          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-figtree text-sm font-medium transition-all relative ${
                isActive
                  ? "bg-[var(--sage-tint)] text-[var(--primary-sage)] font-semibold shadow-2xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "text-[var(--primary-sage)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[1.8]" />
              </div>

              {!isCollapsed && <span className="truncate flex-1">{label}</span>}

              {/* Today's Classes Badge */}
              {!isCollapsed && item.badge && item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-sage)] text-[var(--on-primary)] leading-none">
                  {item.badge}
                </span>
              )}

              {/* Locked Gated Item */}
              {!isCollapsed && item.locked && (
                <Lock className="w-3.5 h-3.5 text-[var(--text-subtle)] shrink-0 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Studio Philosophy Footer (Expanded only) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)]/40 rounded-b-xl m-2">
          <p className="font-outfit text-[10px] tracking-[0.25em] font-bold text-[var(--primary-sage)] uppercase mb-1">
            MOVE WITH INTENTION
          </p>
          <p className="font-figtree text-xs text-[var(--text-muted)] leading-relaxed">
            Your mindful space for daily balance and growth.
          </p>
        </div>
      )}
    </aside>
  );
}
