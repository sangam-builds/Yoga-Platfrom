import { ClassStyle, DayTimeSlot, ExperienceLevel } from "@prisma/client";

export interface OnboardingDefaults {
  experienceLevel: ExperienceLevel;
  goals: string[];
  preferredStyles: ClassStyle[];
  preferredTimes: DayTimeSlot[];
  preferredDays: number[];
  weeklyGoal: number;
}

export const SAFE_ONBOARDING_DEFAULTS: OnboardingDefaults = {
  experienceLevel: "BEGINNER",
  goals: ["flexibility", "stress_relief", "mindfulness"],
  preferredStyles: ["HATHA", "VINYASA", "MEDITATION", "BREATHWORK"],
  preferredTimes: ["MORNING", "EVENING"],
  preferredDays: [1, 3, 5], // Monday, Wednesday, Friday
  weeklyGoal: 3,
};
