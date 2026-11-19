"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Current theme: ${isDark ? "Dark" : "Light"}. Click to toggle theme.`}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-center transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)] cursor-pointer ${className}`}
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-[var(--accent-amber)] transition-transform hover:scale-110" />
      ) : (
        <Sun className="w-4 h-4 text-[var(--accent-amber)] transition-transform hover:scale-110" />
      )}
    </button>
  );
}
