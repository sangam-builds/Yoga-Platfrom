"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Globe,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Clock,
  Layers,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createClient } from "@/utils/supabase/client";

interface InstructorHeaderProps {
  instructorEmail: string;
  instructorName: string;
  timezone?: string;
  unreadCount?: number;
}

export function InstructorHeader({
  instructorEmail,
  instructorName,
  timezone = "Asia/Kolkata",
  unreadCount = 2,
}: InstructorHeaderProps) {
  const router = useRouter();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<"en" | "hi" | "pa">("en");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  ];

  return (
    <header className="h-16 bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-hairline)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs select-none font-figtree">
      {/* Search Bar (Own classes and students) */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your classes, students, or poses..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] transition-all text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] font-medium"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
        {/* Timezone pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
          <Clock className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
          <span>{timezone}</span>
        </div>

        {/* Language Switcher (English, Hindi, Punjabi) */}
        <div className="relative">
          <button
            onClick={() => {
              setLangDropdownOpen(!langDropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors shadow-2xs cursor-pointer"
          >
            <Globe className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="font-figtree text-xs font-semibold">
              {currentLang === "en" ? "English" : currentLang === "hi" ? "हिन्दी" : "ਪੰਜਾਬੀ"}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--text-subtle)]" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100 font-figtree">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code as "en" | "hi" | "pa");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer ${
                    currentLang === lang.code
                      ? "font-bold text-[var(--primary-sage)] bg-[var(--sage-tint)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-sage)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Bell */}
        <Link
          href="/instructor/notifications"
          aria-label="Open notifications"
          className="relative w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
        >
          <Bell className="w-4 h-4 text-[var(--text-primary)] stroke-[1.8]" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--negative-rose)] ring-2 ring-[var(--bg-surface)] animate-pulse" />
          )}
        </Link>

        {/* Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setLangDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors shadow-2xs cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] font-outfit font-bold text-xs flex items-center justify-center">
              {instructorName ? instructorName.charAt(0).toUpperCase() : "I"}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-[var(--text-primary)] max-w-[120px] truncate">
              {instructorName.split(" ")[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--text-subtle)]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100 font-figtree">
              <div className="px-4 py-2 border-b border-[var(--border-hairline)]">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate font-outfit">
                  {instructorName}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{instructorEmail}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-[var(--primary-sage)]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approved Lead Teacher</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/instructor/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  <User className="w-4 h-4 text-[var(--text-muted)]" />
                  Public Profile
                </Link>
                <Link
                  href="/instructor/classes"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  <Layers className="w-4 h-4 text-[var(--text-muted)]" />
                  My Classes
                </Link>
                <Link
                  href="/instructor/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                  Security & MFA
                </Link>
              </div>

              <div className="pt-1 border-t border-[var(--border-hairline)]">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--negative-rose)] hover:bg-[var(--negative-rose-tint)] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

