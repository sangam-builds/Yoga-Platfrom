"use client";

import React from "react";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  centerLabel?: React.ReactNode;
  centerSubtext?: string;
  className?: string;
  ariaLabel?: string;
}

export function ProgressRing({
  value,
  max,
  size = 80,
  strokeWidth = 7,
  color = "var(--primary-sage)",
  trackColor = "var(--border-hairline)",
  centerLabel,
  centerSubtext,
  className = "",
  ariaLabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value / (max || 1), 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel || `${Math.round(percentage * 100)}% completed`}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Centered Content */}
      {(centerLabel || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
          {centerLabel && (
            <span className="font-outfit font-bold text-base text-[var(--text-primary)] leading-tight">
              {centerLabel}
            </span>
          )}
          {centerSubtext && (
            <span className="font-figtree text-[10px] text-[var(--text-muted)] leading-none mt-0.5">
              {centerSubtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
