"use client";

import React, { useState } from "react";
import { ShieldCheck, Info } from "lucide-react";
import { ONBOARDING_STEPS } from "@/modules/onboarding/onboarding.config";
import { OptionCard } from "../OptionCard";

interface StepLimitationsProps {
  limitations?: string[];
  notes?: string;
  pregnancy?: boolean;
  onChange: (data: {
    limitations: string[];
    notes?: string;
    pregnancy?: boolean;
  }) => void;
}

export function StepLimitations({
  limitations = [],
  notes = "",
  pregnancy = false,
  onChange,
}: StepLimitationsProps) {
  const options = ONBOARDING_STEPS.limitations.options || [];
  const [localNotes, setLocalNotes] = useState(notes);

  const handleToggle = (id: string) => {
    let nextList: string[];

    if (id === "none") {
      nextList = ["none"];
    } else {
      const filtered = limitations.filter((item) => item !== "none");
      if (filtered.includes(id)) {
        nextList = filtered.filter((item) => item !== id);
      } else {
        nextList = [...filtered, id];
      }
    }

    onChange({
      limitations: nextList,
      notes: localNotes,
      pregnancy: nextList.includes("pregnancy"),
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, 500);
    setLocalNotes(val);
    onChange({
      limitations,
      notes: val,
      pregnancy,
    });
  };

  return (
    <div className="space-y-5">
      {/* Privacy Notice Banner */}
      <div
        role="note"
        className="p-3.5 sm:p-4 rounded-xl text-xs sm:text-[13px] bg-[var(--sage-tint)] border border-[var(--primary-sage)]/25 text-[var(--text-primary)] flex items-start gap-2.5 leading-relaxed"
      >
        <ShieldCheck className="w-4 h-4 text-[var(--primary-sage)] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[var(--primary-sage)]">Privacy Protected: </span>
          Used only to suggest suitable class modifications. Never shown to other students. Please consult your physician for medical conditions.
        </div>
      </div>

      {/* Selectable Limitations Grid */}
      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Physical Limitations">
        <legend className="sr-only">Physical considerations</legend>
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            id={opt.id}
            label={opt.label}
            description={opt.description}
            selected={limitations.includes(opt.id)}
            isMultiSelect={true}
            onSelect={handleToggle}
          />
        ))}
      </fieldset>

      {/* Optional Detail Notes */}
      <div className="pt-2">
        <label
          htmlFor="limitations-notes"
          className="flex items-center justify-between text-xs font-medium text-[var(--text-primary)] mb-1.5"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            Additional details or modifications (Optional)
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {localNotes.length}/500
          </span>
        </label>
        <textarea
          id="limitations-notes"
          rows={3}
          maxLength={500}
          value={localNotes}
          onChange={handleNotesChange}
          placeholder="e.g., recovering from right shoulder strain, prefer gentle wrists variations..."
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary-sage)] focus:ring-2 focus:ring-[var(--primary-sage)]/20 outline-none resize-none transition-all"
        />
      </div>
    </div>
  );
}
