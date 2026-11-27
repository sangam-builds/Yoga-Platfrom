import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { OnboardingService } from "../onboarding.service.ts";
import type { OnboardingRepository } from "../onboarding.repository.ts";
import { ConflictError, BadRequestError } from "../../../lib/errors.ts";

describe("Onboarding Service Unit Tests", () => {
  function createMockRepo(initialOverrides: any = {}): OnboardingRepository {
    const defaultData = {
      user: {
        id: "usr_unit_test",
        email: "test@zenflow.yoga",
        name: "Test Yogi",
        experienceLevel: "BEGINNER",
        goals: ["flexibility"],
        preferredStyles: ["HATHA"],
        preferredTimes: ["MORNING"],
        preferredDays: [1, 3],
        weeklyGoal: 3,
        timezone: "Asia/Kolkata",
        locale: "en",
        onboardingCompleted: false,
        onboardingProgress: {
          id: "prog_1",
          userId: "usr_unit_test",
          flowVersion: "v1",
          status: "IN_PROGRESS",
          currentStep: "experience",
          startedAt: new Date(),
          completedAt: null,
          skippedAt: null,
          updatedAt: new Date("2026-01-01T12:00:00Z"),
        },
        limitationsRecord: null,
        marketingConsent: null,
        subscriptions: [],
      },
    };

    const mockState = { ...defaultData, ...initialOverrides };

    return {
      findUserWithOnboarding: async (userId: string) => {
        return mockState.user as any;
      },
      getOrCreateProgress: async (userId: string) => {
        return mockState.user.onboardingProgress as any;
      },
      saveStepAnswer: async (params: any) => {
        if (params.expectedUpdatedAt) {
          const currentMs = mockState.user.onboardingProgress.updatedAt.getTime();
          const expectedMs = new Date(params.expectedUpdatedAt).getTime();
          if (Math.abs(currentMs - expectedMs) > 1000) {
            throw new Error("STALE_VERSION");
          }
        }
        mockState.user.onboardingProgress.currentStep = params.nextStep;
        mockState.user.onboardingProgress.updatedAt = new Date();
        return mockState.user.onboardingProgress as any;
      },
      completeOnboardingTransaction: async (params: any) => {
        mockState.user.onboardingCompleted = true;
        mockState.user.onboardingProgress.status = "COMPLETED";
        mockState.user.onboardingProgress.completedAt = new Date();
        return {
          user: mockState.user,
          progress: mockState.user.onboardingProgress,
          trialActivated: true,
        } as any;
      },
      skipOnboardingTransaction: async (params: any) => {
        mockState.user.onboardingCompleted = true;
        mockState.user.onboardingProgress.status = "SKIPPED";
        mockState.user.onboardingProgress.skippedAt = new Date();
        mockState.user.onboardingProgress.completedAt = new Date();
        return {
          user: mockState.user,
          progress: mockState.user.onboardingProgress,
          trialActivated: true,
        } as any;
      },
      restartOnboarding: async (userId: string) => {
        mockState.user.onboardingProgress.status = "IN_PROGRESS";
        mockState.user.onboardingProgress.currentStep = "experience";
        return mockState.user.onboardingProgress as any;
      },
      getLimitations: async () => null,
    } as unknown as OnboardingRepository;
  }

  test("1. Returns initial onboarding state and progress", async () => {
    const service = new OnboardingService(createMockRepo());
    const state = await service.getOnboardingState("usr_unit_test");

    assert.equal(state.flowVersion, "v1");
    assert.equal(state.progress.status, "IN_PROGRESS");
    assert.equal(state.progress.currentStep, "experience");
    assert.equal(state.answers.experienceLevel, "BEGINNER");
  });

  test("2. Rejects invalid step ID", async () => {
    const service = new OnboardingService(createMockRepo());
    await assert.rejects(
      () =>
        service.saveStep({
          userId: "usr_unit_test",
          step: "invalid_step_name",
          data: {},
        }),
      (err: any) => err instanceof BadRequestError
    );
  });

  test("3. Advances step smoothly on valid answer", async () => {
    const service = new OnboardingService(createMockRepo());
    const result = await service.saveStep({
      userId: "usr_unit_test",
      step: "experience",
      data: { experienceLevel: "ADVANCED" },
    });

    assert.equal(result.success, true);
    assert.equal(result.currentStep, "goals");
  });

  test("4. Throws ConflictError on stale optimistic concurrency match", async () => {
    const service = new OnboardingService(createMockRepo());
    await assert.rejects(
      () =>
        service.saveStep({
          userId: "usr_unit_test",
          step: "experience",
          data: { experienceLevel: "ADVANCED" },
          ifMatch: "2020-01-01T00:00:00Z", // outdated timestamp
        }),
      (err: any) => err instanceof ConflictError && err.code === "STALE_VERSION"
    );
  });

  test("5. Completes onboarding and activates free trial", async () => {
    const service = new OnboardingService(createMockRepo());
    const result = await service.completeOnboarding("usr_unit_test");

    assert.equal(result.success, true);
    assert.equal(result.status, "COMPLETED");
    assert.equal(result.trialActivated, true);
    assert.ok(result.completedAt);
  });

  test("6. Skips onboarding with safe defaults", async () => {
    const service = new OnboardingService(createMockRepo());
    const result = await service.skipOnboarding("usr_unit_test");

    assert.equal(result.success, true);
    assert.equal(result.status, "SKIPPED");
    assert.equal(result.trialActivated, true);
  });

  test("7. Restarts onboarding back to step 1", async () => {
    const service = new OnboardingService(createMockRepo());
    const result = await service.restartOnboarding("usr_unit_test");

    assert.equal(result.success, true);
    assert.equal(result.status, "IN_PROGRESS");
    assert.equal(result.currentStep, "experience");
  });
});
