"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${className}`} />
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Current theme: ${theme}. Click to toggle theme.`}
      title={`Theme: ${theme || "system"} (Click to cycle)`}
      className={`relative w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] flex items-center justify-center transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)] cursor-pointer ${className}`}
    >
      {theme === "system" ? (
        <Laptop className="w-4 h-4 text-[var(--text-muted)]" />
      ) : isDark ? (
        <Moon className="w-4 h-4 text-[var(--accent-amber)]" />
      ) : (
        <Sun className="w-4 h-4 text-[var(--accent-amber)]" />
      )}
    </button>
  );
}
