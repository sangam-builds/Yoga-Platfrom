"use client";

import React, { useState } from "react";
import { Table, BarChart2, PieChart, Activity, Clock } from "lucide-react";
import {
  WeeklyMinutesPoint,
  MonthlyClassPoint,
  StyleDistribution,
  TimeOfDayDistribution,
} from "@/lib/hooks/dashboard/useAttendanceData";

interface AttendanceChartsProps {
  weeklyMinutes: WeeklyMinutesPoint[];
  monthlyClasses: MonthlyClassPoint[];
  styles: StyleDistribution[];
  timeOfDay: TimeOfDayDistribution[];
  className?: string;
}

export function AttendanceCharts({
  weeklyMinutes,
  monthlyClasses,
  styles,
  timeOfDay,
  className = "",
}: AttendanceChartsProps) {
  const [viewAsTable, setViewAsTable] = useState(false);

  // 1. Weekly Minutes Chart Math
  const maxMins = Math.max(...weeklyMinutes.map((w) => w.minutes), 300);
  const chartW = 500;
  const chartH = 160;
  const paddingX = 30;
  const paddingY = 20;

  const points = weeklyMinutes.map((pt, i) => {
    const x = paddingX + (i / (weeklyMinutes.length - 1)) * (chartW - paddingX * 2);
    const y = chartH - paddingY - (pt.minutes / maxMins) * (chartH - paddingY * 2);
    return { x, y, pt };
  });

  const areaPointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
  const areaPath = `M ${areaPointsStr} L ${points[points.length - 1].x},${chartH - paddingY} L ${points[0].x},${chartH - paddingY} Z`;
  const linePath = `M ${areaPointsStr}`;

  // Goal line y (180 mins)
  const goalY = chartH - paddingY - (180 / maxMins) * (chartH - paddingY * 2);

  // 2. Monthly Bar Chart Math
  const maxMonthCount = Math.max(...monthlyClasses.map((m) => m.count), 25);

  // 3. Style Donut Math
  const totalStyleCount = styles.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Table Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
            PRACTICE METRICS & HABITS
          </span>
          <h3 className="font-outfit font-semibold text-lg text-[var(--text-primary)]">
            Visual Trend Analytics
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setViewAsTable(!viewAsTable)}
          aria-pressed={viewAsTable}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer"
        >
          {viewAsTable ? <BarChart2 className="w-3.5 h-3.5 text-[var(--primary-sage)]" /> : <Table className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
          <span>{viewAsTable ? "View as Charts" : "View as Table"}</span>
        </button>
      </div>

      {viewAsTable ? (
        /* Accessible Table View Alternative */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h4 className="font-outfit font-semibold text-sm mb-3">Weekly Mat Minutes</h4>
            <table className="w-full text-xs font-figtree">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-left text-[var(--text-muted)]">
                  <th className="pb-2">Week</th>
                  <th className="pb-2">Practiced</th>
                  <th className="pb-2">Target</th>
                </tr>
              </thead>
              <tbody>
                {weeklyMinutes.map((w) => (
                  <tr key={w.weekLabel} className="border-b border-[var(--border-hairline)]/40">
                    <td className="py-1.5 font-medium">{w.weekLabel}</td>
                    <td className="py-1.5 text-[var(--primary-sage)] font-bold">{w.minutes}m</td>
                    <td className="py-1.5 text-[var(--text-muted)]">{w.goalMinutes}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <h4 className="font-outfit font-semibold text-sm mb-3">Favorite Yoga Styles</h4>
            <table className="w-full text-xs font-figtree">
              <thead>
                <tr className="border-b border-[var(--border-hairline)] text-left text-[var(--text-muted)]">
                  <th className="pb-2">Style</th>
                  <th className="pb-2">Classes</th>
                  <th className="pb-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {styles.map((s) => (
                  <tr key={s.style} className="border-b border-[var(--border-hairline)]/40">
                    <td className="py-1.5 font-medium">{s.style}</td>
                    <td className="py-1.5">{s.count}</td>
                    <td className="py-1.5 font-bold">{s.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Charts Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Chart 1: Area Chart - Minutes Practiced per Week (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      Weekly Practice Minutes
                    </h4>
                    <p className="font-figtree text-[11px] text-[var(--text-muted)]">
                      Target line: 180 min/week
                    </p>
                  </div>
                </div>

                <span className="font-figtree text-xs font-bold text-[var(--primary-sage)]">
                  Avg 219m / wk
                </span>
              </div>

              {/* Area SVG Chart */}
              <div className="relative w-full h-[180px] mt-4">
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  className="w-full h-full overflow-visible"
                  aria-label="Area graph showing weekly practice minutes"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary-sage)" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="var(--primary-sage)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Goal Line at 180 min */}
                  <line
                    x1={paddingX}
                    y1={goalY}
                    x2={chartW - paddingX}
                    y2={goalY}
                    stroke="var(--accent-amber)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.8"
                  />
                  <text
                    x={chartW - paddingX - 4}
                    y={goalY - 5}
                    textAnchor="end"
                    fill="var(--accent-amber)"
                    className="font-figtree text-[9px] font-bold"
                  >
                    180m Goal
                  </text>

                  {/* Fill Area */}
                  <path d={areaPath} fill="url(#areaGradient)" />

                  {/* Smooth Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--primary-sage)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Point Nodes */}
                  {points.map((p, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="var(--bg-surface)"
                        stroke="var(--primary-sage)"
                        strokeWidth="2"
                        className="transition-transform group-hover:r-6"
                      />
                      {/* X-axis label */}
                      <text
                        x={p.x}
                        y={chartH - 4}
                        textAnchor="middle"
                        fill="var(--text-subtle)"
                        className="font-figtree text-[9px] font-medium"
                      >
                        {p.pt.weekLabel}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Chart 2: Monthly Classes Bar Chart (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-outfit font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                    Monthly Classes
                  </h4>
                  <p className="font-figtree text-[11px] text-[var(--text-muted)]">
                    Sessions attended by month
                  </p>
                </div>
              </div>

              {/* Bar Columns Container */}
              <div className="h-[150px] flex items-end justify-between gap-3 pt-6 px-2">
                {monthlyClasses.map((m) => {
                  const barHeight = Math.round((m.count / maxMonthCount) * 100);

                  return (
                    <div
                      key={m.month}
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                    >
                      <span className="font-figtree text-[10px] font-bold text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.count}
                      </span>
                      <div className="w-full bg-[var(--bg-elevated)] rounded-t-lg h-24 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                            m.isCurrent
                              ? "bg-[var(--primary-sage)] shadow-xs"
                              : "bg-[var(--primary-sage)]/40 hover:bg-[var(--primary-sage)]/60"
                          }`}
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <span
                        className={`font-figtree text-[10px] ${
                          m.isCurrent
                            ? "font-bold text-[var(--primary-sage)]"
                            : "text-[var(--text-subtle)]"
                        }`}
                      >
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart 3: Favorite Styles Donut (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-outfit font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                  Favorite Yoga Styles
                </h4>
                <p className="font-figtree text-[11px] text-[var(--text-muted)]">
                  Practice diversity breakdown
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              {/* Circular Style Donut */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {(() => {
                    let cumulative = 0;
                    return styles.map((s, idx) => {
                      const strokeDasharray = `${s.percentage * 2.512} ${251.2}`;
                      const strokeDashoffset = -cumulative * 2.512;
                      cumulative += s.percentage;

                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke={s.color}
                          strokeWidth="15"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-700"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-outfit font-bold text-lg text-[var(--text-primary)] leading-none">
                    {totalStyleCount}
                  </span>
                  <span className="font-figtree text-[10px] text-[var(--text-muted)] mt-0.5">
                    classes
                  </span>
                </div>
              </div>

              {/* Styles Legend List */}
              <div className="flex-1 w-full space-y-2">
                {styles.map((s) => (
                  <div key={s.style} className="flex items-center justify-between text-xs font-figtree">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[var(--text-primary)] font-medium truncate">{s.style}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[var(--text-muted)]">{s.count} classes</span>
                      <span className="font-bold text-[var(--text-primary)] w-8 text-right">
                        {s.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 4: Time of Day Preferred Flow (6 cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xs hover:shadow-xs transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-outfit font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                  Preferred Time of Day
                </h4>
                <p className="font-figtree text-[11px] text-[var(--text-muted)]">
                  Circadian practice rhythm
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {timeOfDay.map((t) => (
                <div key={t.timeSlot} className="space-y-1.5 font-figtree">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[var(--text-primary)]">{t.timeSlot}</span>
                    <span className="font-bold text-[var(--primary-sage)]">
                      {t.classes} classes ({t.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-hairline)]">
                    <div
                      className="h-full bg-[var(--primary-sage)] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
