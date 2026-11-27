"use client";

import React from "react";
import { ONBOARDING_STEPS } from "@/modules/onboarding/onboarding.config";
import { OptionCard } from "../OptionCard";

interface StepGoalsProps {
  values?: string[];
  onChange: (values: string[]) => void;
}

export function StepGoals({ values = [], onChange }: StepGoalsProps) {
  const options = ONBOARDING_STEPS.goals.options || [];

  const handleToggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((item) => item !== id));
    } else {
      onChange([...values, id]);
    }
  };

  return (
    <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-label="Yoga Practice Goals">
      <legend className="sr-only">Select your goals</legend>
      {options.map((opt) => (
        <OptionCard
          key={opt.id}
          id={opt.id}
          label={opt.label}
          description={opt.description}
          iconName={opt.icon}
          selected={values.includes(opt.id)}
          isMultiSelect={true}
          onSelect={handleToggle}
        />
      ))}
    </fieldset>
  );
}
