"use client";

import React from "react";
import { ONBOARDING_STEPS } from "@/modules/onboarding/onboarding.config";
import { OptionCard } from "../OptionCard";

interface StepExperienceProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export function StepExperience({ value, onChange }: StepExperienceProps) {
  const options = ONBOARDING_STEPS.experience.options || [];

  return (
    <fieldset className="space-y-3" role="radiogroup" aria-label="Yoga Experience Level">
      <legend className="sr-only">Choose your experience level</legend>
      {options.map((opt) => (
        <OptionCard
          key={opt.id}
          id={opt.id}
          label={opt.label}
          description={opt.description}
          iconName={opt.icon}
          selected={value === opt.id}
          isMultiSelect={false}
          onSelect={(id) => onChange(id)}
        />
      ))}
    </fieldset>
  );
}
