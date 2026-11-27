import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeUserState, sanitizeReturnUrl, type UserLifecycleInput } from "../lifecycle.state.ts";

describe("Lifecycle State Engine: computeUserState", () => {
  const baseUser: UserLifecycleInput["user"] = {
    id: "usr_123",
    email: "yogi@example.com",
    emailVerified: new Date("2026-01-01T00:00:00Z"),
    onboardingCompleted: false,
    firstBookingAt: null,
    checklistDismissedAt: null,
    trialStartedAt: null,
    trialEndsAt: null,
  };

  test("1. Unverified email redirects to /verify-email", () => {
    const state = computeUserState({
      user: { ...baseUser, emailVerified: null },
      onboardingProgress: null,
      bookingsCount: 0,
      hasActiveSubscription: false,
    });

    assert.equal(state.stage, "UNVERIFIED");
    assert.equal(state.redirectTo, "/verify-email");
    assert.equal(state.flags.isEmailVerified, false);
    assert.ok(state.banner?.show);
  });

  test("2. Verified user with incomplete onboarding redirects to saved step", () => {
    const state = computeUserState({
      user: baseUser,
      onboardingProgress: {
        status: "IN_PROGRESS",
        currentStep: "styles",
        flowVersion: "v1",
      },
      bookingsCount: 0,
      hasActiveSubscription: false,
    });

    assert.equal(state.stage, "ONBOARDING");
    assert.equal(state.redirectTo, "/onboarding?step=styles");
    assert.equal(state.currentStep, "styles");
    assert.equal(state.flags.isOnboardingCompleted, false);
  });

  test("3. Verified user without onboardingProgress starts at experience step", () => {
    const state = computeUserState({
      user: baseUser,
      onboardingProgress: null,
      bookingsCount: 0,
      hasActiveSubscription: false,
    });

    assert.equal(state.stage, "ONBOARDING");
    assert.equal(state.redirectTo, "/onboarding?step=experience");
    assert.equal(state.currentStep, "experience");
  });

  test("4. User who skipped onboarding advances to WELCOME_FIRST_BOOKING", () => {
    const state = computeUserState({
      user: baseUser,
      onboardingProgress: {
        status: "SKIPPED",
        currentStep: "summary",
        flowVersion: "v1",
        skippedAt: new Date(),
      },
      bookingsCount: 0,
      hasActiveSubscription: false,
    });

    assert.equal(state.stage, "WELCOME_FIRST_BOOKING");
    assert.equal(state.redirectTo, "/welcome");
    assert.equal(state.flags.isOnboardingCompleted, true);
    assert.equal(state.flags.isOnboardingSkipped, true);
  });

  test("5. Legacy user with onboardingCompleted=true is never forced into onboarding", () => {
    const state = computeUserState({
      user: { ...baseUser, onboardingCompleted: true },
      onboardingProgress: null,
      bookingsCount: 1,
      hasActiveSubscription: true,
    });

    assert.equal(state.stage, "DASHBOARD");
    assert.equal(state.redirectTo, "/dashboard");
    assert.equal(state.flags.isOnboardingCompleted, true);
  });

  test("6. User with completed onboarding and 0 bookings redirects to /welcome", () => {
    const state = computeUserState({
      user: { ...baseUser, onboardingCompleted: true },
      onboardingProgress: {
        status: "COMPLETED",
        currentStep: "summary",
        flowVersion: "v1",
      },
      bookingsCount: 0,
      hasActiveSubscription: false,
    });

    assert.equal(state.stage, "WELCOME_FIRST_BOOKING");
    assert.equal(state.redirectTo, "/welcome");
  });

  test("7. User with existing bookings redirects to sanitized returnUrl or /dashboard", () => {
    const state = computeUserState({
      user: { ...baseUser, onboardingCompleted: true, firstBookingAt: new Date() },
      onboardingProgress: {
        status: "COMPLETED",
        currentStep: "summary",
        flowVersion: "v1",
      },
      bookingsCount: 1,
      hasActiveSubscription: true,
      returnUrl: "/classes/vinyasa-flow",
    });

    assert.equal(state.stage, "DASHBOARD");
    assert.equal(state.redirectTo, "/classes/vinyasa-flow");
  });

  test("8. Checklist handles dismissal and progress percentage", () => {
    const state = computeUserState({
      user: { ...baseUser, checklistDismissedAt: new Date() },
      onboardingProgress: null,
      bookingsCount: 0,
      hasActiveSubscription: false,
    });

    assert.equal(state.checklist.visible, false);
    assert.equal(state.flags.isChecklistDismissed, true);
  });
});

describe("Return URL Sanitization", () => {
  test("Allows relative paths", () => {
    assert.equal(sanitizeReturnUrl("/dashboard"), "/dashboard");
    assert.equal(sanitizeReturnUrl("/classes/123?sort=asc"), "/classes/123?sort=asc");
  });

  test("Rejects protocol-relative open redirects", () => {
    assert.equal(sanitizeReturnUrl("//evil.com"), null);
    assert.equal(sanitizeReturnUrl("//evil.com/path"), null);
  });

  test("Rejects absolute external URLs and backslashes", () => {
    assert.equal(sanitizeReturnUrl("https://evil.com"), null);
    assert.equal(sanitizeReturnUrl("http://evil.com/test"), null);
    assert.equal(sanitizeReturnUrl("/\\evil.com"), null);
  });

  test("Rejects pseudo protocols", () => {
    assert.equal(sanitizeReturnUrl("javascript:alert(1)"), null);
    assert.equal(sanitizeReturnUrl("data:text/html,..."), null);
  });
});
