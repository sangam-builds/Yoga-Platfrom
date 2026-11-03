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
    <header className="h-16 bg-white border-b border-[#E9E2D0] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Bar (Own classes and students) */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your classes, students, or poses..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8F7F2] border border-[#E9E2D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-[#292D2A] placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Timezone pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F7F2] border border-[#E9E2D0] text-[11px] font-mono text-stone-600">
          <Clock className="w-3.5 h-3.5 text-[#6B8F71]" />
          <span>{timezone}</span>
        </div>

        {/* Language Switcher (English, Hindi, Punjabi) */}
        <div className="relative">
          <button
            onClick={() => {
              setLangDropdownOpen(!langDropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-stone-600 hover:text-stone-900 hover:bg-[#F8F7F2] border border-transparent hover:border-[#E9E2D0] transition-colors"
          >
            <Globe className="w-4 h-4 text-stone-500" />
            <span className="uppercase font-mono text-[11px] font-semibold">
              {currentLang}
            </span>
            <ChevronDown className="w-3 h-3 text-stone-400" />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#E9E2D0] rounded-2xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code as "en" | "hi" | "pa");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F8F7F2] transition-colors ${
                    currentLang === lang.code
                      ? "font-bold text-[#233D32] bg-[#F8F7F2]"
                      : "text-stone-600"
                  }`}
                >
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B8F71]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <Link
          href="/instructor/notifications"
          className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#F8F7F2] border border-transparent hover:border-[#E9E2D0] transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Link>

        {/* Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setLangDropdownOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-[#F8F7F2] border border-transparent hover:border-[#E9E2D0] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#6B8F71] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {instructorName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="font-semibold text-[#292D2A] block truncate max-w-[120px]">
                {instructorName}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Instructor</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E9E2D0] rounded-2xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#E9E2D0]">
                <p className="text-xs font-semibold text-[#233D32] truncate">
                  {instructorName}
                </p>
                <p className="text-[11px] text-stone-500 truncate">{instructorEmail}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-[#6B8F71]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approved Lead Teacher</span>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/instructor/profile"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F8F7F2]"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  Public Profile
                </Link>
                <Link
                  href="/instructor/classes"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F8F7F2]"
                >
                  <Layers className="w-4 h-4 text-stone-400" />
                  My Classes
                </Link>
                <Link
                  href="/instructor/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-[#F8F7F2]"
                >
                  <Clock className="w-4 h-4 text-stone-400" />
                  Security & MFA
                </Link>
              </div>

              <div className="pt-1 border-t border-[#E9E2D0]">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
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
