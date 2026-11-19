"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

interface MobileTabBarProps {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    avatarUrl?: string | null;
    role?: string;
  };
  hasActivePlan?: boolean;
  todayBookingsCount?: number;
}

export function MobileTabBar({
  user,
  hasActivePlan = false,
  todayBookingsCount = 0,
}: MobileTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
      label: "Settings & Profile",
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
              <span className="text-[10px] mt-0.5 tracking-tight font-figtree">{tab.label}</span>
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
          <span className="text-[10px] mt-0.5 tracking-tight font-figtree">More</span>
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
            className="w-full bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom font-figtree"
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)] mb-4">
              <span className="font-outfit font-bold text-base text-[var(--text-primary)]">
                More Options
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

            {/* Profile Section (Moved here for smaller viewports) */}
            {user && (
              <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] mb-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] font-outfit font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate font-outfit">
                      {user.name || "Student"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.role && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--sage-tint)] text-[var(--primary-sage)] shrink-0">
                      {user.role}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-hairline)]">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-medium transition-colors shadow-2xs cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                    <span>My Account</span>
                  </Link>

                  <Link
                    href="/dashboard/membership"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-medium transition-colors shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
                    <span>Membership</span>
                  </Link>
                </div>

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-xl bg-[var(--sage-tint)]/60 text-xs text-[var(--primary-sage)] font-semibold border border-[var(--primary-sage)]/20 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </div>
            )}

            {/* Theme Toggle Option (Moved here for smaller viewports) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-amber-tint)] flex items-center justify-center text-[var(--accent-amber)] shrink-0 shadow-2xs">
                  {resolvedTheme === "dark" ? (
                    <Moon className="w-4 h-4 fill-[var(--accent-amber)]" />
                  ) : (
                    <Sun className="w-4 h-4 fill-[var(--accent-amber)]" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)] font-outfit">
                    Theme Appearance
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] capitalize">
                    {resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* More Navigation Links */}
            <div className="space-y-1 mb-3">
              <span className="text-[10px] uppercase font-outfit tracking-[0.2em] text-[var(--primary-sage)] font-bold px-2 block mb-1">
                Studio Sections
              </span>
              {moreItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors ${
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

                    {item.locked ? (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-subtle)]">
                        <Lock className="w-3 h-3" />
                        <span>Plan required</span>
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Button */}
            <div className="pt-2 border-t border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--negative-rose-tint)] hover:bg-[var(--negative-rose)]/15 text-[var(--negative-rose)] text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

