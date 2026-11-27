import { z } from "zod";
import type { StepId } from "./onboarding.config.ts";

export const experienceStepSchema = z
  .object({
    experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  })
  .strict();

export const goalsStepSchema = z
  .object({
    goals: z.array(z.string().min(1)).min(1, "Please select at least one goal"),
  })
  .strict();

export const limitationsStepSchema = z
  .object({
    limitations: z.array(z.string().min(1)).default([]),
    notes: z.string().max(500).optional(),
    pregnancy: z.boolean().optional(),
  })
  .strict();

export const stylesStepSchema = z
  .object({
    preferredStyles: z
      .array(
        z.enum([
          "HATHA",
          "VINYASA",
          "YIN",
          "ASHTANGA",
          "POWER",
          "PRENATAL",
          "MEDITATION",
          "BREATHWORK",
        ])
      )
      .min(1, "Please select at least one style"),
  })
  .strict();

export const scheduleStepSchema = z
  .object({
    preferredTimes: z
      .array(z.enum(["MORNING", "AFTERNOON", "EVENING"]))
      .default([]),
    preferredDays: z.array(z.number().int().min(0).max(6)).default([]),
  })
  .strict();

export const weeklyGoalStepSchema = z
  .object({
    weeklyGoal: z.number().int().min(1).max(7),
  })
  .strict();

export const localeStepSchema = z
  .object({
    timezone: z.string().min(1, "Timezone is required"),
    locale: z.enum(["en", "hi", "pa"]),
  })
  .strict();

export const summaryStepSchema = z
  .object({
    marketingOptIn: z.boolean().optional().default(false),
    whatsappOptIn: z.boolean().optional().default(false),
  })
  .strict();

export const stepSchemas: Record<StepId, z.ZodTypeAny> = {
  experience: experienceStepSchema,
  goals: goalsStepSchema,
  limitations: limitationsStepSchema,
  styles: stylesStepSchema,
  schedule: scheduleStepSchema,
  weekly_goal: weeklyGoalStepSchema,
  locale: localeStepSchema,
  summary: summaryStepSchema,
};

export const completeOnboardingSchema = z
  .object({
    experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
    goals: z.array(z.string()).optional(),
    preferredStyles: z
      .array(
        z.enum([
          "HATHA",
          "VINYASA",
          "YIN",
          "ASHTANGA",
          "POWER",
          "PRENATAL",
          "MEDITATION",
          "BREATHWORK",
        ])
      )
      .optional(),
    preferredTimes: z
      .array(z.enum(["MORNING", "AFTERNOON", "EVENING"]))
      .optional(),
    preferredDays: z.array(z.number().int().min(0).max(6)).optional(),
    weeklyGoal: z.number().int().min(1).max(7).optional(),
    timezone: z.string().optional(),
    locale: z.enum(["en", "hi", "pa"]).optional(),
    limitations: z.array(z.string()).optional(),
    notes: z.string().max(500).optional(),
    pregnancy: z.boolean().optional(),
    marketingOptIn: z.boolean().optional(),
    whatsappOptIn: z.boolean().optional(),
  })
  .strict();

export const skipOnboardingSchema = z
  .object({
    marketingOptIn: z.boolean().optional(),
    whatsappOptIn: z.boolean().optional(),
  })
  .strict();
