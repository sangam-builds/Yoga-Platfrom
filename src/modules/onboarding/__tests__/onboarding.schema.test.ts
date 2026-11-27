import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  experienceStepSchema,
  goalsStepSchema,
  limitationsStepSchema,
  stylesStepSchema,
  scheduleStepSchema,
  weeklyGoalStepSchema,
  localeStepSchema,
  skipOnboardingSchema,
  completeOnboardingSchema,
} from "../onboarding.schema.ts";

describe("Onboarding Schemas Validation", () => {
  test("1. Experience step schema requires valid enum and rejects unknown fields", () => {
    const valid = experienceStepSchema.parse({ experienceLevel: "BEGINNER" });
    assert.equal(valid.experienceLevel, "BEGINNER");

    assert.throws(() => {
      experienceStepSchema.parse({ experienceLevel: "EXPERT" });
    });

    assert.throws(() => {
      experienceStepSchema.parse({ experienceLevel: "BEGINNER", hackerField: "injected" });
    });
  });

  test("2. Goals step schema requires at least one goal and strict fields", () => {
    const valid = goalsStepSchema.parse({ goals: ["flexibility", "stress_relief"] });
    assert.deepEqual(valid.goals, ["flexibility", "stress_relief"]);

    assert.throws(() => {
      goalsStepSchema.parse({ goals: [] });
    });

    assert.throws(() => {
      goalsStepSchema.parse({ goals: ["strength"], extra: 123 });
    });
  });

  test("3. Limitations step schema allows empty, notes up to 500 chars, pregnancy flag", () => {
    const valid = limitationsStepSchema.parse({
      limitations: ["back", "knees"],
      notes: "Lower back disc recovery",
      pregnancy: false,
    });
    assert.deepEqual(valid.limitations, ["back", "knees"]);
    assert.equal(valid.pregnancy, false);

    assert.throws(() => {
      limitationsStepSchema.parse({
        limitations: ["wrists"],
        notes: "a".repeat(501),
      });
    });
  });

  test("4. Styles step schema requires valid enum values and at least one", () => {
    const valid = stylesStepSchema.parse({ preferredStyles: ["HATHA", "VINYASA"] });
    assert.deepEqual(valid.preferredStyles, ["HATHA", "VINYASA"]);

    assert.throws(() => {
      stylesStepSchema.parse({ preferredStyles: [] });
    });

    assert.throws(() => {
      stylesStepSchema.parse({ preferredStyles: ["INVALID_YOGA_STYLE"] });
    });
  });

  test("5. Schedule step schema validates times and days 0-6", () => {
    const valid = scheduleStepSchema.parse({
      preferredTimes: ["MORNING", "EVENING"],
      preferredDays: [1, 3, 5],
    });
    assert.deepEqual(valid.preferredTimes, ["MORNING", "EVENING"]);
    assert.deepEqual(valid.preferredDays, [1, 3, 5]);

    assert.throws(() => {
      scheduleStepSchema.parse({
        preferredDays: [7], // out of 0-6 range
      });
    });
  });

  test("6. Weekly goal step schema strictly bounds 1 to 7 classes", () => {
    assert.equal(weeklyGoalStepSchema.parse({ weeklyGoal: 1 }).weeklyGoal, 1);
    assert.equal(weeklyGoalStepSchema.parse({ weeklyGoal: 3 }).weeklyGoal, 3);
    assert.equal(weeklyGoalStepSchema.parse({ weeklyGoal: 7 }).weeklyGoal, 7);

    assert.throws(() => weeklyGoalStepSchema.parse({ weeklyGoal: 0 }));
    assert.throws(() => weeklyGoalStepSchema.parse({ weeklyGoal: 8 }));
    assert.throws(() => weeklyGoalStepSchema.parse({ weeklyGoal: 2.5 }));
  });

  test("7. Locale step schema validates timezone and supported languages", () => {
    const valid = localeStepSchema.parse({
      timezone: "Asia/Kolkata",
      locale: "hi",
    });
    assert.equal(valid.locale, "hi");

    assert.throws(() => {
      localeStepSchema.parse({
        timezone: "Asia/Kolkata",
        locale: "es", // unsupported locale
      });
    });
  });

  test("8. Skip and complete schemas validate cleanly", () => {
    const skipValid = skipOnboardingSchema.parse({ marketingOptIn: true, whatsappOptIn: false });
    assert.equal(skipValid.marketingOptIn, true);

    const completeValid = completeOnboardingSchema.parse({
      experienceLevel: "ADVANCED",
      weeklyGoal: 4,
    });
    assert.equal(completeValid.experienceLevel, "ADVANCED");
    assert.equal(completeValid.weeklyGoal, 4);
  });
});
