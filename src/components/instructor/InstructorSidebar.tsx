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
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-primary)] border-r border-[var(--border-hairline)] select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--border-hairline)] shrink-0">
        <Link href="/instructor" className="flex items-center gap-3 group overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-[var(--primary-sage)]" />
          </div>
          <div>
            <span className="font-outfit font-bold text-base text-[var(--text-primary)] tracking-tight block leading-none">
              ZenFlow
            </span>
            <span className="font-figtree text-[10px] tracking-[0.2em] font-semibold text-[var(--primary-sage)] uppercase block mt-0.5">
              Instructor Portal
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-figtree">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {section.title && (
              <p className="px-3 text-[10px] uppercase font-outfit tracking-[0.2em] text-[var(--primary-sage)] font-bold mb-1.5">
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
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    active
                      ? "bg-[var(--sage-tint)] text-[var(--primary-sage)] font-semibold shadow-2xs"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                        active ? "text-[var(--primary-sage)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.isLive && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--negative-rose-tint)] text-[var(--negative-rose)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative-rose)] animate-pulse" />
                      Live
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--primary-sage)] text-[var(--on-primary)] font-figtree font-bold">
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
      <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)]/60 font-figtree shrink-0">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">Verified Teacher</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-subtle)] font-mono">
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
          className="w-12 h-12 rounded-full bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-xl flex items-center justify-center border border-[var(--primary-hover)] cursor-pointer"
          aria-label="Open menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full h-full bg-[var(--bg-surface)] z-50">
            {navContent}
          </div>
        </div>
      )}

      {/* Bottom Tabs on Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-t border-[var(--border-hairline)] z-30 flex items-center justify-around px-2 text-[var(--text-muted)] font-figtree">
        <Link
          href="/instructor"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname === "/instructor" ? "text-[var(--primary-sage)] font-bold" : "text-[var(--text-muted)]"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/instructor/schedule"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith("/instructor/schedule") ? "text-[var(--primary-sage)] font-bold" : "text-[var(--text-muted)]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule</span>
        </Link>
        <Link
          href="/instructor/live"
          className={`flex flex-col items-center gap-1 text-[10px] relative ${
            pathname.startsWith("/instructor/live") ? "text-[var(--negative-rose)] font-bold" : "text-[var(--negative-rose)]/80"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[var(--negative-rose)] text-white flex items-center justify-center -mt-4 shadow-lg border-2 border-[var(--bg-surface)]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-semibold">Live</span>
        </Link>
        <Link
          href="/instructor/attendance"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith("/instructor/attendance") ? "text-[var(--primary-sage)] font-bold" : "text-[var(--text-muted)]"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Roster</span>
        </Link>
        <Link
          href="/instructor/earnings"
          className={`flex flex-col items-center gap-1 text-[10px] ${
            pathname.startsWith("/instructor/earnings") ? "text-[var(--primary-sage)] font-bold" : "text-[var(--text-muted)]"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Earnings</span>
        </Link>
      </div>
    </>
  );
}

