"use client";

import React, { useEffect, useState } from "react";
import { Sparkline } from "./Sparkline";

interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  deltaText?: string | null;
  deltaPositive?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
  subtext?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  deltaText,
  deltaPositive = true,
  sparklineData,
  sparklineColor = "var(--primary-sage)",
  subtext,
  className = "",
}: StatCardProps) {
  // Animated count-up if value is numeric
  const numericVal = typeof value === "number" ? value : parseFloat(String(value));
  const isNumeric = !isNaN(numericVal) && !String(value).includes("m") && !String(value).includes("h");

  const [displayCount, setDisplayCount] = useState<number>(isNumeric ? 0 : 0);

  useEffect(() => {
    if (!isNumeric) return;

    let start = 0;
    const duration = 600; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = Math.round(start + (numericVal - start) * ease);
      setDisplayCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [numericVal, isNumeric]);

  // Clean delta logic: hide if nothing meaningful (+0 or empty)
  const showDelta =
    deltaText &&
    deltaText.trim() !== "" &&
    !deltaText.includes("+0") &&
    !deltaText.includes("-0") &&
    deltaText !== "0" &&
    deltaText !== "+0 vs last month";

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-all shadow-2xs hover:shadow-xs hover:border-[var(--border-hairline)] flex flex-col justify-between select-none ${className}`}
    >
      {/* Top Row: Icon in soft circle & Delta / Sparkline */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center shrink-0 shadow-2xs">
          {icon}
        </div>

        {sparklineData && sparklineData.length > 1 ? (
          <Sparkline data={sparklineData} width={56} height={22} color={sparklineColor} />
        ) : showDelta ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-figtree font-semibold border ${
              deltaPositive
                ? "bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] border-transparent"
                : "bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] border-transparent"
            }`}
          >
            {deltaText}
          </span>
        ) : null}
      </div>

      {/* Middle: Big Stat Number */}
      <div>
        <p className="font-figtree text-xs font-medium text-[var(--text-muted)] truncate mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1 font-outfit text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          <span>{isNumeric ? displayCount : value}</span>
          {unit && <span className="text-sm font-medium text-[var(--text-muted)]">{unit}</span>}
        </div>
      </div>

      {/* Bottom Subtext or Delta note */}
      {subtext && (
        <p className="font-figtree text-[11px] text-[var(--text-subtle)] mt-2 truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
