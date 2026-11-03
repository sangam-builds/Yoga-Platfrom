"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Radio,
  BookmarkCheck,
  CreditCard,
  DollarSign,
  Ticket,
  Sparkles,
  Award,
  Video,
  FileText,
  Settings,
  Activity,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface NavGroup {
  groupName: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }>;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navGroups: NavGroup[] = [
    {
      groupName: "Overview",
      items: [
        { label: "KPIs & Analytics", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      groupName: "People",
      items: [
        { label: "Users & Members", href: "/admin/users", icon: Users },
        { label: "Instructors", href: "/admin/instructors", icon: GraduationCap },
        { label: "Admins & Sub-Roles", href: "/admin/admins", icon: ShieldCheck },
      ],
    },
    {
      groupName: "Classes & Studio",
      items: [
        { label: "Curriculum & Schedules", href: "/admin/classes", icon: Calendar },
        { label: "Live Room Monitor", href: "/admin/live-monitor", icon: Radio, badge: "Live" },
        { label: "Bookings & Attendance", href: "/admin/bookings", icon: BookmarkCheck },
      ],
    },
    {
      groupName: "Money & Billing",
      items: [
        { label: "Payments & Refunds", href: "/admin/payments", icon: CreditCard },
        { label: "Plans & Tiers", href: "/admin/plans", icon: DollarSign },
        { label: "Coupons & Codes", href: "/admin/coupons", icon: Ticket },
        { label: "Instructor Payouts", href: "/admin/payouts", icon: DollarSign },
      ],
    },
    {
      groupName: "Content & Assets",
      items: [
        { label: "Asana & Pose Library", href: "/admin/poses", icon: Sparkles },
        { label: "Certificate Templates", href: "/admin/certificates", icon: Award },
        { label: "Recorded Replays", href: "/admin/recordings", icon: Video },
      ],
    },
    {
      groupName: "System & Operations",
      items: [
        { label: "Security Audit Logs", href: "/admin/audit", icon: FileText },
        { label: "Feature Flags & Settings", href: "/admin/settings", icon: Settings },
        { label: "System Health & Uptime", href: "/admin/health", icon: Activity },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#1A2F26] text-[#F8F7F2] border-r border-[#233D32] flex flex-col justify-between shrink-0 min-h-screen">
      {/* Top Branding */}
      <div className="p-5 border-b border-[#233D32]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#6B8F71] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-white">
              ZenFlow
            </h1>
            <span className="text-[10px] tracking-widest uppercase text-[#A8C2AC] font-semibold block -mt-0.5">
              Enterprise Admin
            </span>
          </div>
        </div>
      </div>

      {/* Nav Groups list */}
      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A8C2AC]/60">
              {group.groupName}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#6B8F71] text-white font-bold shadow-xs"
                        : "text-[#F8F7F2]/75 hover:bg-[#233D32] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 opacity-80" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-md bg-rose-500 text-white text-[9px] font-bold animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Footer */}
      <div className="p-4 border-t border-[#233D32] space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs text-[#A8C2AC] hover:bg-[#233D32] transition-colors"
        >
          <span>Student Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
}
