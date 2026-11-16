"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Globe,
  User as UserIcon,
  CreditCard,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/utils/supabase/client";

interface TopbarProps {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    role: string;
  };
  unreadNotificationsCount?: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenMobileMenu?: () => void;
}

export function Topbar({
  user,
  unreadNotificationsCount = 0,
  onOpenSearch,
  onOpenNotifications,
  onOpenMobileMenu,
}: TopbarProps) {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleLanguageChange = async (lang: Locale) => {
    setLocale(lang);
    setIsLangMenuOpen(false);
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: lang }),
      });
    } catch {
      // Non-blocking
    }
  };

  const languages: { code: Locale; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "hi", label: "Hindi", native: "हिन्दी" },
    { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <header className="sticky top-0 z-20 h-16 w-full border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 select-none">
      {/* Left: Mobile Menu Button & Search Trigger */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Global Search Bar Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex-1 h-9.5 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] flex items-center justify-between text-xs sm:text-sm font-figtree transition-all shadow-2xs group cursor-pointer"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[var(--text-primary)] shrink-0 transition-colors" />
            <span className="truncate">{t("search.placeholder") || "Search classes, instructors, poses..."}</span>
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md shadow-2xs">
            <span>⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Language Switcher */}
        <div className="relative" ref={langMenuRef}>
          <button
            type="button"
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            aria-label="Switch language"
            className="h-9 px-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center gap-1.5 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="hidden sm:inline">{currentLang.native}</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-subtle)]" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                    locale === l.code
                      ? "text-[var(--primary-sage)] font-semibold bg-[var(--sage-tint)]/60"
                      : "text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span>{l.native}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark / System) */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open notifications"
          className="relative w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
        >
          <Bell className="w-4 h-4 text-[var(--text-primary)] stroke-[1.8]" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--negative-rose)] ring-2 ring-[var(--bg-surface)] animate-pulse" />
          )}
        </button>

        {/* User Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors shadow-2xs cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] font-outfit font-bold text-xs flex items-center justify-center">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-[var(--text-primary)] max-w-[120px] truncate">
              {user.name.split(" ")[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--text-subtle)]" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 font-figtree">
              {/* User Bio Header */}
              <div className="p-2 border-b border-[var(--border-hairline)] mb-1">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[var(--sage-tint)] text-[var(--sage-tint-icon)]">
                  {user.role}
                </span>
              </div>

              {/* Links */}
              <Link
                href="/dashboard/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Profile & Account</span>
              </Link>
              <Link
                href="/dashboard/membership"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Membership & Credits</span>
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--primary-sage)] hover:bg-[var(--sage-tint)] font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
              )}

              <div className="border-t border-[var(--border-hairline)] my-1" />

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--negative-rose)] hover:bg-[var(--negative-rose-tint)] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
