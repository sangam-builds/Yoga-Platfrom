"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Globe,
  MoreHorizontal,
  Leaf,
} from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NotificationDrawer } from "./NotificationDrawer";
import { StatusBanners } from "./StatusBanners";
import { createClient } from "@/utils/supabase/client";

interface NavItem {
  id: string;
  nameKey: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  locked?: boolean;
}

export interface AppShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    role: string;
    hasActivePlan?: boolean;
    creditsRemaining?: number;
    emailVerified?: boolean;
    todayBookingsCount?: number;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const collapsed = localStorage.getItem("zenflow_sidebar_collapsed") === "true";
    setIsCollapsed(collapsed);

    const savedTheme = localStorage.getItem("zenflow_theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("zenflow_sidebar_collapsed", String(newState));
  };

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    localStorage.setItem("zenflow_theme", newDark ? "dark" : "light");
    if (newDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems: NavItem[] = [
    { id: "overview", nameKey: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { id: "schedule", nameKey: "nav.schedule", href: "/dashboard/schedule", icon: Calendar },
    {
      id: "bookings",
      nameKey: "nav.bookings",
      href: "/dashboard/bookings",
      icon: BookmarkCheck,
      badge: user.todayBookingsCount || undefined,
    },
    { id: "membership", nameKey: "nav.membership", href: "/dashboard/membership", icon: CreditCard },
    { id: "attendance", nameKey: "nav.attendance", href: "/dashboard/attendance", icon: CheckCircle2 },
    { id: "certificates", nameKey: "nav.certificates", href: "/dashboard/certificates", icon: Award },
    {
      id: "recordings",
      nameKey: "nav.recordings",
      href: "/dashboard/recordings",
      icon: Video,
      locked: !user.hasActivePlan,
    },
    { id: "journal", nameKey: "nav.journal", href: "/dashboard/journal", icon: BookOpen },
    { id: "poses", nameKey: "nav.poses", href: "/dashboard/poses", icon: Sparkles },
    { id: "assistant", nameKey: "nav.assistant", href: "/dashboard/assistant", icon: Bot },
    { id: "settings", nameKey: "nav.settings", href: "/dashboard/settings", icon: Settings },
  ];

  // Top 4 items + "More" on mobile bottom bar
  const mobilePrimaryNav = navItems.slice(0, 4);
  const mobileMoreNav = navItems.slice(4);

  const isAdmin = user.role === "ADMIN" || user.email === "admin@zenflow.yoga";

  return (
    <div className="min-h-screen bg-[#FAF6ED] dark:bg-[#121E17] text-[#29352F] dark:text-[#E8EFE8] flex flex-col antialiased font-figtree">
      {/* ─── Top Navigation Bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 h-16 bg-[#FAF6ED]/95 dark:bg-[#16241C]/95 backdrop-blur-md border-b border-[#D1DBCF] dark:border-[#283E31] flex items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-[#E1EDDD] text-[#35523E] flex items-center justify-center shadow-2xs group-hover:bg-[#47664A] group-hover:text-white transition-all">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-[#29352F] dark:text-white">
              ZenFlow
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#47664A] text-white hover:bg-[#3B563E] transition-colors ml-2 font-outfit"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
        </div>

        {/* Global Search Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#6C7B72] dark:text-[#A4B5A9] hover:text-[#29352F] dark:hover:text-white text-xs border border-[#D1DBCF] dark:border-[#283E31] hover:border-[#47664A] transition-all max-w-sm w-full mx-6 shadow-2xs"
        >
          <Search className="w-4 h-4 text-[#637063]" />
          <span className="flex-1 text-left truncate">{t("common.search")}</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#14221A] border border-[#D1DBCF] dark:border-[#283E31] rounded-md text-[#29352F] dark:text-gray-300">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-[#5C6B63] dark:text-[#A4B5A9] hover:bg-[#E1EDDD]/50 dark:hover:bg-[#203428]"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Switcher */}
          <div className="relative group">
            <button
              type="button"
              className="p-2 rounded-xl text-[#5C6B63] dark:text-[#A4B5A9] hover:bg-[#E1EDDD]/50 dark:hover:bg-[#203428] transition-colors flex items-center gap-1 text-xs font-semibold font-outfit"
              aria-label="Change Language"
            >
              <Globe className="w-4 h-4 text-[#637063]" />
              <span className="uppercase">{locale}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-[#FAF6ED] dark:bg-[#16241C] rounded-xl shadow-xl border border-[#D1DBCF] dark:border-[#283E31] p-1 hidden group-hover:block animate-in fade-in z-50">
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${
                  locale === "en" ? "bg-[#47664A] text-white font-semibold" : "hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428]"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLocale("hi")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${
                  locale === "hi" ? "bg-[#47664A] text-white font-semibold" : "hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428]"
                }`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => setLocale("pa")}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${
                  locale === "pa" ? "bg-[#47664A] text-white font-semibold" : "hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428]"
                }`}
              >
                ਪੰਜਾਬੀ (Punjabi)
              </button>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#5C6B63] dark:text-[#A4B5A9] hover:bg-[#E1EDDD]/50 dark:hover:bg-[#203428] transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#5C6B63]" />}
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => setIsNotificationOpen(true)}
            className="p-2 rounded-xl text-[#5C6B63] dark:text-[#A4B5A9] hover:bg-[#E1EDDD]/50 dark:hover:bg-[#203428] transition-colors relative"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4 text-[#637063]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#47664A]" />
          </button>

          {/* User Avatar Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#47664A] transition-all"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#47664A] text-white font-semibold text-xs flex items-center justify-center font-outfit shadow-2xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-[#FAF6ED] dark:bg-[#16241C] rounded-2xl shadow-2xl border border-[#D1DBCF] dark:border-[#283E31] p-2 z-50 animate-in fade-in"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-[#D1DBCF] dark:border-[#283E31]">
                  <p className="text-xs font-bold text-[#29352F] dark:text-white truncate font-outfit">{user.name}</p>
                  <p className="text-[11px] text-[#6C7B72] truncate">{user.email}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-[#29352F] dark:text-[#E8EFE8] hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428]"
                  >
                    <UserIcon className="w-4 h-4 text-[#637063]" />
                    <span>{t("nav.profile")}</span>
                  </Link>
                  <Link
                    href="/dashboard/membership"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-[#29352F] dark:text-[#E8EFE8] hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428]"
                  >
                    <CreditCard className="w-4 h-4 text-[#637063]" />
                    <span>{t("nav.billing")}</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-[#29352F] dark:text-[#E8EFE8] hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428]"
                  >
                    <Settings className="w-4 h-4 text-[#637063]" />
                    <span>{t("nav.settings")}</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#D1DBCF] dark:border-[#283E31]">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content Shell ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-[calc(100vh-4rem)]">
        {/* Desktop & Tablet Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6ED]/80 dark:bg-[#14221A]/80 backdrop-blur-xs transition-all duration-300 shrink-0 ${
            isCollapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Nav Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              if (item.locked) {
                return (
                  <Link
                    key={item.id}
                    href="/dashboard/membership"
                    title={isCollapsed ? `${t(item.nameKey)} (Upgrade Plan)` : undefined}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8C9B92] hover:bg-[#E1EDDD]/40 hover:text-[#29352F] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 opacity-60" />
                      {!isCollapsed && <span className="truncate">{t(item.nameKey)}</span>}
                    </div>
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </Link>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={isCollapsed ? t(item.nameKey) : undefined}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? "bg-[#47664A] text-white shadow-xs font-semibold"
                      : "text-[#5C6B63] dark:text-[#A4B5A9] hover:bg-[#E1EDDD]/60 dark:hover:bg-[#203428] hover:text-[#29352F] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{t(item.nameKey)}</span>}
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-outfit ${
                        isActive
                          ? "bg-white text-[#47664A]"
                          : "bg-[#E1EDDD] text-[#35523E]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Toggle Footer */}
          <div className="p-3 border-t border-[#D1DBCF] dark:border-[#283E31] flex items-center justify-end">
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[#6C7B72] hover:bg-[#E1EDDD]/50 dark:hover:bg-[#203428] transition-colors cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* Main Panel Viewport */}
        <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {/* Status Banners (stacked by priority) */}
          <StatusBanners
            emailVerified={user.emailVerified}
            creditsRemaining={user.creditsRemaining}
          />

          {children}
        </main>
      </div>

      {/* ─── Mobile Bottom Tab Bar (360px+) ─────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6ED]/95 dark:bg-[#16241C]/95 backdrop-blur-md border-t border-[#D1DBCF] dark:border-[#283E31] flex items-center justify-around h-16 px-2 safe-area-pb">
        {mobilePrimaryNav.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors relative ${
                isActive
                  ? "text-[#47664A] dark:text-[#A7C8B0] font-bold"
                  : "text-[#6C7B72] dark:text-[#8FA395]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 truncate max-w-[50px] font-medium">{t(item.nameKey)}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[#47664A]" />
              )}
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={() => setIsMobileMoreOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[#6C7B72] dark:text-[#8FA395]`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">{t("nav.more")}</span>
        </button>
      </div>

      {/* Mobile "More" Sheet */}
      {isMobileMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-fadeIn"
          onClick={() => setIsMobileMoreOpen(false)}
        >
          <div
            className="bg-[#FAF6ED] dark:bg-[#16241C] rounded-t-3xl border-t border-[#D1DBCF] dark:border-[#283E31] p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D1DBCF] dark:border-[#283E31]">
              <h3 className="font-outfit font-semibold text-lg text-[#29352F] dark:text-white">More Options</h3>
              <button
                type="button"
                onClick={() => setIsMobileMoreOpen(false)}
                className="p-1 rounded-lg text-[#6C7B72]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mobileMoreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] hover:bg-[#E1EDDD]/50 dark:hover:bg-[#203428] transition-colors"
                  >
                    <Icon className="w-5 h-5 text-[#47664A]" />
                    <span className="text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8]">
                      {t(item.nameKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  );
}

