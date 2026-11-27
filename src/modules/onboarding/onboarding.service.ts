import {
  ONBOARDING_FLOW_VERSION,
  ONBOARDING_STEPS,
  type StepId,
  getNextStep,
} from "./onboarding.config.ts";
import {
  stepSchemas,
  completeOnboardingSchema,
  skipOnboardingSchema,
} from "./onboarding.schema.ts";
import { onboardingRepository, OnboardingRepository } from "./onboarding.repository.ts";
import { maskLimitations } from "./onboarding.crypto.ts";
import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors.ts";

export class OnboardingService {
  private repo: OnboardingRepository;

  constructor(repo: OnboardingRepository = onboardingRepository) {
    this.repo = repo;
  }

  async getOnboardingState(userId: string) {
    const user = await this.repo.findUserWithOnboarding(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const progress =
      user.onboardingProgress || (await this.repo.getOrCreateProgress(userId));

    // Safely extract limitations (masked by default)
    let limitationsSummary = { hasLimitations: false, count: 0 };
    if (user.limitationsRecord) {
      try {
        const decrypted = await this.repo.getLimitations(userId);
        limitationsSummary = maskLimitations(decrypted?.limitations);
      } catch {
        // Fallback safely
      }
    }

    const answers = {
      experienceLevel: user.experienceLevel,
      goals: user.goals,
      limitations: limitationsSummary,
      preferredStyles: user.preferredStyles,
      preferredTimes: user.preferredTimes,
      preferredDays: user.preferredDays,
      weeklyGoal: user.weeklyGoal,
      timezone: user.timezone,
      locale: user.locale,
      marketingOptIn: user.marketingConsent?.emailMarketingOptIn ?? false,
      whatsappOptIn: user.marketingConsent?.whatsappOptIn ?? false,
    };

    return {
      flowVersion: ONBOARDING_FLOW_VERSION,
      progress: {
        status: progress.status,
        currentStep: progress.currentStep,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
        skippedAt: progress.skippedAt,
        updatedAt: progress.updatedAt,
      },
      answers,
    };
  }

  async saveStep(params: {
    userId: string;
    step: string;
    data: unknown;
    ifMatch?: string | null;
  }) {
    const { userId, step, data, ifMatch } = params;

    // Validate valid step ID
    if (!ONBOARDING_STEPS[step as StepId]) {
      throw new BadRequestError(`Invalid step: ${step}`);
    }

    const schema = stepSchemas[step as StepId];
    if (!schema) {
      throw new BadRequestError(`No validation schema for step: ${step}`);
    }

    // Validate payload against strict step schema
    const validatedData = schema.parse(data);

    const nextStep = getNextStep(step as StepId);

    let expectedUpdatedAt: Date | undefined;
    if (ifMatch) {
      expectedUpdatedAt = new Date(ifMatch);
      if (isNaN(expectedUpdatedAt.getTime())) {
        expectedUpdatedAt = undefined;
      }
    }

    try {
      const updatedProgress = await this.repo.saveStepAnswer({
        userId,
        step,
        nextStep,
        expectedUpdatedAt,
        data: validatedData,
      });

      return {
        success: true,
        currentStep: updatedProgress.currentStep,
        updatedAt: updatedProgress.updatedAt,
      };
    } catch (err: any) {
      if (err?.message === "STALE_VERSION") {
        throw new ConflictError(
          "Your onboarding session was updated on another device. Please refresh.",
          "STALE_VERSION"
        );
      }
      throw err;
    }
  }

  async completeOnboarding(userId: string, rawData?: unknown) {
    let validatedPreferences: any = undefined;
    if (rawData && Object.keys(rawData as object).length > 0) {
      validatedPreferences = completeOnboardingSchema.parse(rawData);
    }

    const result = await this.repo.completeOnboardingTransaction({
      userId,
      preferences: validatedPreferences,
    });

    return {
      success: true,
      status: result.progress.status,
      trialActivated: result.trialActivated,
      completedAt: result.progress.completedAt,
    };
  }

  async skipOnboarding(userId: string, rawData?: unknown) {
    let validatedConsent: any = undefined;
    if (rawData && Object.keys(rawData as object).length > 0) {
      validatedConsent = skipOnboardingSchema.parse(rawData);
    }

    const result = await this.repo.skipOnboardingTransaction({
      userId,
      consent: validatedConsent,
    });

    return {
      success: true,
      status: result.progress.status,
      trialActivated: result.trialActivated,
      skippedAt: result.progress.skippedAt,
    };
  }

  async restartOnboarding(userId: string) {
    const progress = await this.repo.restartOnboarding(userId);
    return {
      success: true,
      status: progress.status,
      currentStep: progress.currentStep,
    };
  }
}

export const onboardingService = new OnboardingService();
