"use client";

import React from "react";
import { ONBOARDING_STEPS } from "@/modules/onboarding/onboarding.config";
import { OptionCard } from "../OptionCard";

interface StepStylesProps {
  values?: string[];
  onChange: (values: string[]) => void;
}

export function StepStyles({ values = [], onChange }: StepStylesProps) {
  const options = ONBOARDING_STEPS.styles.options || [];

  const handleToggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((item) => item !== id));
    } else {
      onChange([...values, id]);
    }
  };

  return (
    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Preferred Yoga Styles">
      <legend className="sr-only">Select your preferred yoga styles</legend>
      {options.map((opt) => (
        <OptionCard
          key={opt.id}
          id={opt.id}
          label={opt.label}
          description={opt.description}
          selected={values.includes(opt.id)}
          isMultiSelect={true}
          onSelect={handleToggle}
        />
      ))}
    </fieldset>
  );
}
