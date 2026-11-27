"use client";

import React from "react";
import { Sparkles, CalendarCheck } from "lucide-react";
import { OptionCard } from "../OptionCard";

interface StepWeeklyGoalProps {
  value?: number;
  onChange: (value: number) => void;
}

const GOAL_OPTIONS = [
  { id: "1", label: "1 class / week", description: "Gentle cadence to build a sustainable ritual." },
  { id: "2", label: "2 classes / week", description: "Balanced cadence for posture, focus, and energy." },
  { id: "3", label: "3 classes / week (Recommended)", description: "The optimal sweet spot for strength, mobility, and stress relief." },
  { id: "4", label: "4 classes / week", description: "Deepening practice with noticeable mind-body transformation." },
  { id: "5", label: "5+ classes / week", description: "Daily commitment for dedicated, immersive wellness." },
];

export function StepWeeklyGoal({ value = 3, onChange }: StepWeeklyGoalProps) {
  return (
    <div className="space-y-4">
      {/* Motivational Callout */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-[var(--primary-sage)] shrink-0" />
        <span>
          Yogis who set a <strong className="text-[var(--text-primary)]">3-class weekly rhythm</strong> are 4x more likely to sustain their practice over 6 months.
        </span>
      </div>

      <fieldset className="space-y-3" role="radiogroup" aria-label="Weekly Practice Goal">
        <legend className="sr-only">Choose weekly class goal</legend>
        {GOAL_OPTIONS.map((opt) => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            description={opt.description}
            selected={value === Number(opt.id)}
            isMultiSelect={false}
            onSelect={(id) => onChange(Number(id))}
          />
        ))}
      </fieldset>
    </div>
  );
}
