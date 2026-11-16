"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./shell/Sidebar";
import { Topbar } from "./shell/Topbar";
import { MobileTabBar } from "./shell/MobileTabBar";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NotificationDrawer } from "./NotificationDrawer";
import { StatusBanners } from "./StatusBanners";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Restore sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("zenflow_sidebar_collapsed") === "true";
      setIsCollapsed(saved);
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem("zenflow_sidebar_collapsed", String(next));
    } catch {
      // LocalStorage unavailable
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-row antialiased">
      {/* Desktop / Tablet Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        hasActivePlan={user.hasActivePlan}
        todayBookingsCount={user.todayBookingsCount}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Topbar */}
        <Topbar
          user={user}
          unreadNotificationsCount={0}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Priority Status Banners */}
        <StatusBanners
          emailVerified={user.emailVerified}
          creditsRemaining={user.creditsRemaining}
        />

        {/* Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        hasActivePlan={user.hasActivePlan}
        todayBookingsCount={user.todayBookingsCount}
      />

      {/* Global Modals & Drawers */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </div>
  );
}
