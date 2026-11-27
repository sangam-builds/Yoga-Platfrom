import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { OnboardingService } from "../onboarding.service.ts";
import { OnboardingRepository } from "../onboarding.repository.ts";
import { computeUserState, sanitizeReturnUrl } from "../../lifecycle/lifecycle.state.ts";
import { ConflictError, BadRequestError } from "../../../lib/errors.ts";
import { SAFE_ONBOARDING_DEFAULTS } from "../onboarding.defaults.ts";

describe("Onboarding End-to-End Integration Tests", () => {
  function createTestHarness() {
    let userState: any = {
      id: "usr_integration_01",
      email: "sam@zenflow.yoga",
      name: "Samadhi Yogi",
      emailVerified: new Date("2026-01-01T00:00:00Z"),
      experienceLevel: null,
      goals: [],
      preferredStyles: [],
      preferredTimes: [],
      preferredDays: [],
      weeklyGoal: 3,
      timezone: "Asia/Kolkata",
      locale: "en",
      onboardingCompleted: false,
      trialStartedAt: null,
      trialEndsAt: null,
      firstBookingAt: null,
      checklistDismissedAt: null,
    };

    let progressState: any = {
      id: "prog_01",
      userId: "usr_integration_01",
      flowVersion: "v1",
      status: "IN_PROGRESS",
      currentStep: "experience",
      startedAt: new Date("2026-01-01T10:00:00Z"),
      completedAt: null,
      skippedAt: null,
      updatedAt: new Date("2026-01-01T10:00:00Z"),
    };

    let limitationsState: any = null;
    let marketingConsentState: any = null;
    let creditLedgerEntries: any[] = [];
    let activationEvents: any[] = [];

    const mockRepo: OnboardingRepository = {
      findUserWithOnboarding: async (userId: string) => {
        return {
          ...userState,
          onboardingProgress: progressState,
          limitationsRecord: limitationsState,
          marketingConsent: marketingConsentState,
          subscriptions: userState.trialStartedAt
            ? [{ status: "TRIALING", creditsRemaining: 5 }]
            : [],
        } as any;
      },
      getOrCreateProgress: async () => progressState as any,
      saveStepAnswer: async (params: any) => {
        if (params.expectedUpdatedAt) {
          const currentMs = progressState.updatedAt.getTime();
          const expectedMs = new Date(params.expectedUpdatedAt).getTime();
          if (Math.abs(currentMs - expectedMs) > 1000) {
            throw new Error("STALE_VERSION");
          }
        }

        // Apply step update
        const step = params.step;
        const data = params.data;
        if (step === "experience") userState.experienceLevel = data.experienceLevel;
        if (step === "goals") userState.goals = data.goals;
        if (step === "limitations") limitationsState = data;
        if (step === "styles") userState.preferredStyles = data.preferredStyles;
        if (step === "schedule") {
          userState.preferredTimes = data.preferredTimes;
          userState.preferredDays = data.preferredDays;
        }
        if (step === "weekly_goal") userState.weeklyGoal = data.weeklyGoal;
        if (step === "locale") {
          userState.timezone = data.timezone;
          userState.locale = data.locale;
        }
        if (step === "summary") {
          marketingConsentState = {
            emailMarketingOptIn: data.marketingOptIn,
            whatsappOptIn: data.whatsappOptIn,
          };
        }

        progressState.currentStep = params.nextStep;
        progressState.updatedAt = new Date();
        return progressState as any;
      },
      completeOnboardingTransaction: async (params: any) => {
        // Idempotency: if already completed, do nothing second time
        if (userState.onboardingCompleted && progressState.status === "COMPLETED") {
          return { user: userState, progress: progressState, trialActivated: false } as any;
        }

        userState.onboardingCompleted = true;
        progressState.status = "COMPLETED";
        progressState.completedAt = new Date();

        let trialActivated = false;
        if (!userState.trialStartedAt) {
          userState.trialStartedAt = new Date();
          userState.trialEndsAt = new Date(Date.now() + 7 * 86400000);
          creditLedgerEntries.push({
            delta: 5,
            balanceAfter: 5,
            reason: "PURCHASE",
          });
          activationEvents.push({ type: "TRIAL_STARTED" });
          trialActivated = true;
        }

        activationEvents.push({ type: "ONBOARDING_COMPLETED" });

        return { user: userState, progress: progressState, trialActivated } as any;
      },
      skipOnboardingTransaction: async (params: any) => {
        if (userState.onboardingCompleted && progressState.status === "SKIPPED") {
          return { user: userState, progress: progressState, trialActivated: false } as any;
        }

        userState.onboardingCompleted = true;
        userState.experienceLevel = SAFE_ONBOARDING_DEFAULTS.experienceLevel;
        userState.goals = SAFE_ONBOARDING_DEFAULTS.goals;
        userState.preferredStyles = SAFE_ONBOARDING_DEFAULTS.preferredStyles;
        userState.preferredTimes = SAFE_ONBOARDING_DEFAULTS.preferredTimes;
        userState.preferredDays = SAFE_ONBOARDING_DEFAULTS.preferredDays;
        userState.weeklyGoal = SAFE_ONBOARDING_DEFAULTS.weeklyGoal;

        progressState.status = "SKIPPED";
        progressState.skippedAt = new Date();
        progressState.completedAt = new Date();

        let trialActivated = false;
        if (!userState.trialStartedAt) {
          userState.trialStartedAt = new Date();
          userState.trialEndsAt = new Date(Date.now() + 7 * 86400000);
          creditLedgerEntries.push({ delta: 5, balanceAfter: 5 });
          activationEvents.push({ type: "TRIAL_STARTED" });
          trialActivated = true;
        }

        activationEvents.push({ type: "ONBOARDING_SKIPPED" });

        return { user: userState, progress: progressState, trialActivated } as any;
      },
      restartOnboarding: async () => {
        progressState.status = "IN_PROGRESS";
        progressState.currentStep = "experience";
        progressState.completedAt = null;
        progressState.skippedAt = null;
        return progressState as any;
      },
      getLimitations: async () => limitationsState,
    } as unknown as OnboardingRepository;

    return {
      service: new OnboardingService(mockRepo),
      getUserState: () => userState,
      getProgress: () => progressState,
      getCredits: () => creditLedgerEntries,
      getEvents: () => activationEvents,
    };
  }

  test("1. Save & Resume: advances sequentially through steps and autosaves answers", async () => {
    const harness = createTestHarness();

    // Step 1: Experience
    const step1 = await harness.service.saveStep({
      userId: "usr_integration_01",
      step: "experience",
      data: { experienceLevel: "BEGINNER" },
    });
    assert.equal(step1.currentStep, "goals");
    assert.equal(harness.getUserState().experienceLevel, "BEGINNER");

    // Step 2: Goals
    const step2 = await harness.service.saveStep({
      userId: "usr_integration_01",
      step: "goals",
      data: { goals: ["flexibility", "stress_relief"] },
    });
    assert.equal(step2.currentStep, "limitations");
    assert.deepEqual(harness.getUserState().goals, ["flexibility", "stress_relief"]);

    // Step 3: Limitations
    const step3 = await harness.service.saveStep({
      userId: "usr_integration_01",
      step: "limitations",
      data: { limitations: ["back"], notes: "Gentle twists please" },
    });
    assert.equal(step3.currentStep, "styles");

    // Step 4: Styles
    const step4 = await harness.service.saveStep({
      userId: "usr_integration_01",
      step: "styles",
      data: { preferredStyles: ["HATHA", "VINYASA"] },
    });
    assert.equal(step4.currentStep, "schedule");

    // Fetch onboarding to verify resume state
    const state = await harness.service.getOnboardingState("usr_integration_01");
    assert.equal(state.progress.currentStep, "schedule");
    assert.equal(state.answers.experienceLevel, "BEGINNER");
  });

  test("2. Stale write rejection: rejects out-of-order writes from multiple devices", async () => {
    const harness = createTestHarness();

    // Device A fetches state at T0
    const initialState = await harness.service.getOnboardingState("usr_integration_01");
    const t0 = initialState.progress.updatedAt.toISOString();

    // Device B advances step to T1
    await harness.service.saveStep({
      userId: "usr_integration_01",
      step: "experience",
      data: { experienceLevel: "ADVANCED" },
    });

    // Device A tries to save with stale timestamp T0
    await assert.rejects(
      () =>
        harness.service.saveStep({
          userId: "usr_integration_01",
          step: "experience",
          data: { experienceLevel: "BEGINNER" },
          ifMatch: t0,
        }),
      (err: any) => err instanceof ConflictError && err.code === "STALE_VERSION"
    );
  });

  test("3. Complete is fully idempotent: double-clicking Finish does not duplicate trial credits", async () => {
    const harness = createTestHarness();

    // First completion
    const firstRes = await harness.service.completeOnboarding("usr_integration_01");
    assert.equal(firstRes.status, "COMPLETED");
    assert.equal(firstRes.trialActivated, true);
    assert.equal(harness.getCredits().length, 1);

    // Second completion (simulated double submit)
    const secondRes = await harness.service.completeOnboarding("usr_integration_01");
    assert.equal(secondRes.status, "COMPLETED");
    assert.equal(secondRes.trialActivated, false); // Not reactivated
    assert.equal(harness.getCredits().length, 1); // Still exactly 1 ledger entry
  });

  test("4. Skip applies safe defaults and activates trial once", async () => {
    const harness = createTestHarness();

    const skipRes = await harness.service.skipOnboarding("usr_integration_01", {
      marketingOptIn: false,
    });

    assert.equal(skipRes.status, "SKIPPED");
    assert.equal(skipRes.trialActivated, true);
    assert.equal(harness.getUserState().experienceLevel, "BEGINNER");
    assert.equal(harness.getUserState().weeklyGoal, 3);
    assert.ok(harness.getUserState().preferredStyles.includes("HATHA"));
    assert.equal(harness.getCredits().length, 1);
  });

  test("5. Trial abuse prevention: existing user who retakes onboarding cannot get free trial again", async () => {
    const harness = createTestHarness();

    // User finishes first time and gets trial
    await harness.service.completeOnboarding("usr_integration_01");
    assert.equal(harness.getCredits().length, 1);

    // User restarts from Settings
    await harness.service.restartOnboarding("usr_integration_01");
    assert.equal(harness.getProgress().status, "IN_PROGRESS");

    // User completes quiz again
    const restartComplete = await harness.service.completeOnboarding("usr_integration_01");
    assert.equal(restartComplete.trialActivated, false);
    assert.equal(harness.getCredits().length, 1); // No new trial credits granted
  });

  test("6. Redirect precedence table is strictly enforced", () => {
    const base = {
      id: "u1",
      email: "yogi@zenflow.yoga",
      emailVerified: null,
      onboardingCompleted: false,
    };

    // 1. Unverified -> /verify-email
    const s1 = computeUserState({
      user: base,
      onboardingProgress: null,
      bookingsCount: 0,
      hasActiveSubscription: false,
    });
    assert.equal(s1.stage, "UNVERIFIED");
    assert.equal(s1.redirectTo, "/verify-email");

    // 2. Verified, onboarding in-progress -> /onboarding
    const s2 = computeUserState({
      user: { ...base, emailVerified: new Date() },
      onboardingProgress: { status: "IN_PROGRESS", currentStep: "styles", flowVersion: "v1" },
      bookingsCount: 0,
      hasActiveSubscription: false,
    });
    assert.equal(s2.stage, "ONBOARDING");
    assert.equal(s2.redirectTo, "/onboarding?step=styles");

    // 3. Onboarding complete, 0 bookings -> /welcome
    const s3 = computeUserState({
      user: { ...base, emailVerified: new Date(), onboardingCompleted: true },
      onboardingProgress: { status: "COMPLETED", currentStep: "summary", flowVersion: "v1" },
      bookingsCount: 0,
      hasActiveSubscription: true,
    });
    assert.equal(s3.stage, "WELCOME_FIRST_BOOKING");
    assert.equal(s3.redirectTo, "/welcome");

    // 4. Booked user -> /dashboard
    const s4 = computeUserState({
      user: { ...base, emailVerified: new Date(), onboardingCompleted: true, firstBookingAt: new Date() },
      onboardingProgress: { status: "COMPLETED", currentStep: "summary", flowVersion: "v1" },
      bookingsCount: 1,
      hasActiveSubscription: true,
    });
    assert.equal(s4.stage, "DASHBOARD");
    assert.equal(s4.redirectTo, "/dashboard");
  });

  test("7. Open redirect attacks are completely neutralized", () => {
    assert.equal(sanitizeReturnUrl("//evil.com/phishing"), null);
    assert.equal(sanitizeReturnUrl("https://malicious.com"), null);
    assert.equal(sanitizeReturnUrl("javascript:void(0)"), null);
    assert.equal(sanitizeReturnUrl("/dashboard/schedule"), "/dashboard/schedule");
  });
});
