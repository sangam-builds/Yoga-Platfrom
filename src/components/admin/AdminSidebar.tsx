"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ShieldCheck,
  FileText,
  Home,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Users & Roles",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Classes & Schedules",
      href: "/admin/classes",
      icon: Calendar,
    },
    {
      label: "Security Audit Logs",
      href: "/admin/audit",
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-[#1A2F26] text-[#F8F7F2] border-r border-[#233D32] flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand & Badge */}
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6B8F71] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              ZenFlow
            </h1>
            <span className="text-[10px] tracking-widest uppercase text-[#A8C2AC] font-semibold block -mt-0.5">
              Admin Console
            </span>
          </div>
        </div>

        {/* Security Indicator */}
        <div className="px-3.5 py-2 rounded-xl bg-[#233D32] border border-[#6B8F71]/30 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#A8C2AC]">Active Role</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6B8F71] text-white font-bold">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#6B8F71] text-white shadow-sm"
                    : "text-[#F8F7F2]/70 hover:bg-[#233D32] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-[#233D32] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-[#F8F7F2]/70 hover:text-white hover:bg-[#233D32] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Public Site</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </aside>
  );
}

