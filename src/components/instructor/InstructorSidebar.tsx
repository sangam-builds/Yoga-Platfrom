"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Calendar,
  Radio,
  Users,
  CheckCircle,
  Video,
  Star,
  DollarSign,
  FolderOpen,
  Clock,
  Bell,
  UserCheck,
  Settings,
  ChevronRight,
  Menu,
  X,
  Shield,
  Layers,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isLive?: boolean;
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { name: "Overview", href: "/instructor", icon: LayoutDashboard },
      { name: "My Classes", href: "/instructor/classes", icon: Layers },
      { name: "Schedule", href: "/instructor/schedule", icon: Calendar },
      { name: "Live Studio", href: "/instructor/live", icon: Radio, isLive: true },
    ],
  },
  {
    title: "Teaching & Students",
    items: [
      { name: "My Students", href: "/instructor/students", icon: Users },
      { name: "Attendance", href: "/instructor/attendance", icon: CheckCircle },
      { name: "Recordings", href: "/instructor/recordings", icon: Video },
      { name: "Reviews & Ratings", href: "/instructor/reviews", icon: Star },
    ],
  },
  {
    title: "Finance & Operations",
    items: [
      { name: "Earnings & Payouts", href: "/instructor/earnings", icon: DollarSign },
      { name: "Curriculum & Poses", href: "/instructor/resources", icon: FolderOpen },
      { name: "Availability & Leave", href: "/instructor/availability", icon: Clock },
      { name: "Notifications", href: "/instructor/notifications", icon: Bell },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "Public Profile", href: "/instructor/profile", icon: UserCheck },
      { name: "Settings & Security", href: "/instructor/settings", icon: Settings },
    ],
  },
];

export function InstructorSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/instructor") return pathname === "/instructor";
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#233D32] text-[#F8F7F2] border-r border-[#305344]">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#305344]">
        <Link href="/instructor" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#6B8F71] text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-white block leading-none">
              ZenFlow
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#A8C2AC] font-semibold">
              Instructor Portal
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <p className="px-3 text-[10px] uppercase font-mono tracking-wider text-[#A8C2AC]/80 font-semibold mb-2">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    active
                      ? "bg-[#6B8F71] text-white shadow-sm font-semibold"
                      : "text-stone-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        active ? "text-white" : "text-[#A8C2AC]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.isLive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-red-500/80 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Live
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Pill */}
      <div className="p-4 border-t border-[#305344] bg-[#1B3228]">
        <div className="flex items-center justify-between text-xs text-[#A8C2AC]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono">Verified Teacher</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-stone-300 font-mono">
            v2.4
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Top Toggle (when sidebar is hidden on small screens) */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-12 h-12 rounded-full bg-[#233D32] text-white shadow-xl flex items-center justify-center border border-[#6B8F71]"
          aria-label="Open menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full h-full bg-[#233D32] z-50">
            {navContent}
          </div>
        </div>
      )}

      {/* Bottom Tabs on Mobile (as requested in spec: page 4) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#233D32] border-t border-[#305344] z-30 flex items-center justify-around px-2 text-[#F8F7F2]">
        <Link
          href="/instructor"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname === "/instructor" ? "text-emerald-400 font-bold" : "text-stone-300"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/instructor/schedule"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith("/instructor/schedule") ? "text-emerald-400 font-bold" : "text-stone-300"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule</span>
        </Link>
        <Link
          href="/instructor/live"
          className={`flex flex-col items-center gap-1 text-[10px] relative ${
            pathname.startsWith("/instructor/live") ? "text-red-400 font-bold" : "text-red-300"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center -mt-4 shadow-lg border-2 border-[#233D32]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-semibold text-white">Live</span>
        </Link>
        <Link
          href="/instructor/attendance"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith("/instructor/attendance") ? "text-emerald-400 font-bold" : "text-stone-300"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Roster</span>
        </Link>
        <Link
          href="/instructor/earnings"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith("/instructor/earnings") ? "text-emerald-400 font-bold" : "text-stone-300"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings</span>
        </Link>
      </div>
    </>
  );
}
