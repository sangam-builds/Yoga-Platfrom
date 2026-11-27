import { prisma } from "../../lib/prisma.ts";
import {
  ClassStyle,
  DayTimeSlot,
  ExperienceLevel,
  Locale,
  OnboardingStatus,
  PlanType,
  BillingInterval,
  SubscriptionStatus,
  CreditReason,
  ActivationEventType,
} from "@prisma/client";
import { encryptLimitations, decryptLimitations } from "./onboarding.crypto.ts";
import { SAFE_ONBOARDING_DEFAULTS } from "./onboarding.defaults.ts";

export class OnboardingRepository {
  async findUserWithOnboarding(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        onboardingProgress: true,
        limitationsRecord: true,
        marketingConsent: true,
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIALING"] } },
          include: { plan: true },
          take: 1,
        },
      },
    });
  }

  async getOrCreateProgress(userId: string) {
    const existing = await prisma.onboardingProgress.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return prisma.onboardingProgress.create({
      data: {
        userId,
        flowVersion: "v1",
        status: OnboardingStatus.IN_PROGRESS,
        currentStep: "experience",
      },
    });
  }

  async saveStepAnswer(params: {
    userId: string;
    step: string;
    nextStep: string;
    expectedUpdatedAt?: Date;
    data: any;
  }) {
    const { userId, step, nextStep, expectedUpdatedAt, data } = params;

    return prisma.$transaction(
      async (tx) => {
        // Optimistic concurrency check
        const currentProgress = await tx.onboardingProgress.findUnique({
          where: { userId },
        });

        if (currentProgress && expectedUpdatedAt) {
          const currentMs = currentProgress.updatedAt.getTime();
          const expectedMs = new Date(expectedUpdatedAt).getTime();
          // Allow within 1 second tolerance for clock variances
          if (Math.abs(currentMs - expectedMs) > 1000) {
            throw new Error("STALE_VERSION");
          }
        }

        // Update specific user preferences based on step
        if (step === "experience" && data.experienceLevel) {
          await tx.user.update({
            where: { id: userId },
            data: { experienceLevel: data.experienceLevel as ExperienceLevel },
          });
        } else if (step === "goals" && data.goals) {
          await tx.user.update({
            where: { id: userId },
            data: { goals: data.goals },
          });
        } else if (step === "limitations") {
          const encrypted = encryptLimitations({
            limitations: data.limitations || [],
            notes: data.notes || null,
            pregnancy: Boolean(data.pregnancy),
          });

          await tx.userLimitations.upsert({
            where: { userId },
            create: {
              userId,
              encryptedData: encrypted.encryptedData,
              iv: encrypted.iv,
              tag: encrypted.tag,
              keyVersion: encrypted.keyVersion,
            },
            update: {
              encryptedData: encrypted.encryptedData,
              iv: encrypted.iv,
              tag: encrypted.tag,
              keyVersion: encrypted.keyVersion,
            },
          });
        } else if (step === "styles" && data.preferredStyles) {
          await tx.user.update({
            where: { id: userId },
            data: { preferredStyles: data.preferredStyles as ClassStyle[] },
          });
        } else if (step === "schedule") {
          await tx.user.update({
            where: { id: userId },
            data: {
              preferredTimes: (data.preferredTimes || []) as DayTimeSlot[],
              preferredDays: data.preferredDays || [],
            },
          });
        } else if (step === "weekly_goal" && data.weeklyGoal) {
          await tx.user.update({
            where: { id: userId },
            data: { weeklyGoal: Number(data.weeklyGoal) },
          });
        } else if (step === "locale") {
          await tx.user.update({
            where: { id: userId },
            data: {
              timezone: data.timezone,
              locale: data.locale as Locale,
            },
          });
        } else if (step === "summary") {
          if (data.marketingOptIn !== undefined || data.whatsappOptIn !== undefined) {
            await tx.marketingConsent.upsert({
              where: { userId },
              create: {
                userId,
                emailMarketingOptIn: Boolean(data.marketingOptIn),
                whatsappOptIn: Boolean(data.whatsappOptIn),
                consentedAt: new Date(),
              },
              update: {
                emailMarketingOptIn: Boolean(data.marketingOptIn),
                whatsappOptIn: Boolean(data.whatsappOptIn),
                consentedAt: new Date(),
              },
            });
          }
        }

        // Advance progress
        const updatedProgress = await tx.onboardingProgress.upsert({
          where: { userId },
          create: {
            userId,
            flowVersion: "v1",
            status: OnboardingStatus.IN_PROGRESS,
            currentStep: nextStep,
          },
          update: {
            currentStep: nextStep,
          },
        });

        // Record milestone event
        await tx.activationEvent.upsert({
          where: {
            userId_type: {
              userId,
              type: ActivationEventType.ONBOARDING_STEP_COMPLETED,
            },
          },
          create: {
            userId,
            type: ActivationEventType.ONBOARDING_STEP_COMPLETED,
            metadata: { step, completedAt: new Date().toISOString() },
          },
          update: {
            metadata: { step, completedAt: new Date().toISOString() },
          },
        });

        return updatedProgress;
      },
      {
        maxWait: 10000,
        timeout: 25000,
      }
    );
  }

  async completeOnboardingTransaction(params: {
    userId: string;
    preferences?: any;
  }) {
    const { userId, preferences } = params;

    // Pre-query trial plan to reduce round trips inside interactive tx
    let cachedTrialPlanId: string | null = null;
    const existingTrialPlan = await prisma.plan.findUnique({
      where: { slug: "free-trial" },
      select: { id: true },
    });
    if (existingTrialPlan) {
      cachedTrialPlanId = existingTrialPlan.id;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { onboardingProgress: true },
        });

        if (!user) throw new Error("User not found");

        // Idempotency: if already completed, return existing success state
        if (user.onboardingCompleted && user.onboardingProgress?.status === OnboardingStatus.COMPLETED) {
          return { user, progress: user.onboardingProgress, trialActivated: false };
        }

        const now = new Date();
        const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Update user preferences if provided
        const updateData: any = {
          onboardingCompleted: true,
        };

        if (preferences?.experienceLevel) updateData.experienceLevel = preferences.experienceLevel;
        if (preferences?.goals) updateData.goals = preferences.goals;
        if (preferences?.preferredStyles) updateData.preferredStyles = preferences.preferredStyles;
        if (preferences?.preferredTimes) updateData.preferredTimes = preferences.preferredTimes;
        if (preferences?.preferredDays) updateData.preferredDays = preferences.preferredDays;
        if (preferences?.weeklyGoal) updateData.weeklyGoal = preferences.weeklyGoal;
        if (preferences?.timezone) updateData.timezone = preferences.timezone;
        if (preferences?.locale) updateData.locale = preferences.locale;

        // Handle limitations if passed in complete payload
        if (preferences?.limitations) {
          const encrypted = encryptLimitations({
            limitations: preferences.limitations,
            notes: preferences.notes || null,
            pregnancy: Boolean(preferences.pregnancy),
          });

          await tx.userLimitations.upsert({
            where: { userId },
            create: {
              userId,
              encryptedData: encrypted.encryptedData,
              iv: encrypted.iv,
              tag: encrypted.tag,
              keyVersion: encrypted.keyVersion,
            },
            update: {
              encryptedData: encrypted.encryptedData,
              iv: encrypted.iv,
              tag: encrypted.tag,
              keyVersion: encrypted.keyVersion,
            },
          });
        }

        // Handle marketing consent if passed
        if (preferences?.marketingOptIn !== undefined || preferences?.whatsappOptIn !== undefined) {
          await tx.marketingConsent.upsert({
            where: { userId },
            create: {
              userId,
              emailMarketingOptIn: Boolean(preferences.marketingOptIn),
              whatsappOptIn: Boolean(preferences.whatsappOptIn),
              consentedAt: now,
            },
            update: {
              emailMarketingOptIn: Boolean(preferences.marketingOptIn),
              whatsappOptIn: Boolean(preferences.whatsappOptIn),
              consentedAt: now,
            },
          });
        }

        // Provision 7-Day Free Trial (one trial per user guarantee)
        let trialActivated = false;
        if (!user.trialStartedAt) {
          updateData.trialStartedAt = now;
          updateData.trialEndsAt = trialEnds;
          trialActivated = true;

          let planId = cachedTrialPlanId;
          if (!planId) {
            let trialPlan = await tx.plan.findUnique({
              where: { slug: "free-trial" },
            });

            if (!trialPlan) {
              trialPlan = await tx.plan.create({
                data: {
                  name: "7-Day Free Trial",
                  slug: "free-trial",
                  type: PlanType.TRIAL,
                  priceInr: 0,
                  interval: BillingInterval.NONE,
                  credits: 5,
                  trialDays: 7,
                  features: ["5 Live Classes", "Community Access", "Standard Video Quality"],
                },
              });
            }
            planId = trialPlan.id;
          }

          // Create trial subscription
          const sub = await tx.subscription.create({
            data: {
              userId,
              planId: planId!,
              status: SubscriptionStatus.TRIALING,
              currentPeriodStart: now,
              currentPeriodEnd: trialEnds,
              trialEndsAt: trialEnds,
              creditsRemaining: 5,
            },
          });

          // Create credit ledger entry
          await tx.creditLedger.create({
            data: {
              userId,
              subscriptionId: sub.id,
              delta: 5,
              balanceAfter: 5,
              reason: CreditReason.PURCHASE,
              note: "Welcome 7-Day Free Trial (5 credits)",
            },
          });

          // Record trial started milestone
          await tx.activationEvent.upsert({
            where: {
              userId_type: {
                userId,
                type: ActivationEventType.TRIAL_STARTED,
              },
            },
            create: {
              userId,
              type: ActivationEventType.TRIAL_STARTED,
              metadata: { trialStartedAt: now.toISOString(), credits: 5 },
            },
            update: {},
          });
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: updateData,
        });

        // Update OnboardingProgress
        const updatedProgress = await tx.onboardingProgress.upsert({
          where: { userId },
          create: {
            userId,
            flowVersion: "v1",
            status: OnboardingStatus.COMPLETED,
            currentStep: "summary",
            completedAt: now,
          },
          update: {
            status: OnboardingStatus.COMPLETED,
            currentStep: "summary",
            completedAt: now,
          },
        });

        // Record completion milestone
        await tx.activationEvent.upsert({
          where: {
            userId_type: {
              userId,
              type: ActivationEventType.ONBOARDING_COMPLETED,
            },
          },
          create: {
            userId,
            type: ActivationEventType.ONBOARDING_COMPLETED,
            metadata: { completedAt: now.toISOString() },
          },
          update: {},
        });

        return { user: updatedUser, progress: updatedProgress, trialActivated };
      },
      {
        maxWait: 15000,
        timeout: 35000,
      }
    );

    // Audit log entry outside the interactive transaction
    prisma.auditLog
      .create({
        data: {
          actorId: userId,
          action: "onboarding.completed",
          entity: "user",
          entityId: userId,
          metadata: { trialActivated: result.trialActivated },
        },
      })
      .catch((err) => {
        console.warn("[OnboardingRepository] Failed to write auditLog", err);
      });

    return result;
  }

  async skipOnboardingTransaction(params: {
    userId: string;
    consent?: { marketingOptIn?: boolean; whatsappOptIn?: boolean };
  }) {
    const { userId, consent } = params;

    let cachedTrialPlanId: string | null = null;
    const existingTrialPlan = await prisma.plan.findUnique({
      where: { slug: "free-trial" },
      select: { id: true },
    });
    if (existingTrialPlan) {
      cachedTrialPlanId = existingTrialPlan.id;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { onboardingProgress: true },
        });

        if (!user) throw new Error("User not found");

        // Idempotency: if already skipped or completed
        if (
          user.onboardingCompleted &&
          (user.onboardingProgress?.status === OnboardingStatus.SKIPPED ||
            user.onboardingProgress?.status === OnboardingStatus.COMPLETED)
        ) {
          return { user, progress: user.onboardingProgress, trialActivated: false };
        }

        const now = new Date();
        const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Apply safe defaults
        const updateData: any = {
          onboardingCompleted: true,
          experienceLevel: SAFE_ONBOARDING_DEFAULTS.experienceLevel,
          goals: SAFE_ONBOARDING_DEFAULTS.goals,
          preferredStyles: SAFE_ONBOARDING_DEFAULTS.preferredStyles,
          preferredTimes: SAFE_ONBOARDING_DEFAULTS.preferredTimes,
          preferredDays: SAFE_ONBOARDING_DEFAULTS.preferredDays,
          weeklyGoal: SAFE_ONBOARDING_DEFAULTS.weeklyGoal,
        };

        // Provision 7-Day Trial if user doesn't already have one
        let trialActivated = false;
        if (!user.trialStartedAt) {
          updateData.trialStartedAt = now;
          updateData.trialEndsAt = trialEnds;
          trialActivated = true;

          let planId = cachedTrialPlanId;
          if (!planId) {
            let trialPlan = await tx.plan.findUnique({
              where: { slug: "free-trial" },
            });

            if (!trialPlan) {
              trialPlan = await tx.plan.create({
                data: {
                  name: "7-Day Free Trial",
                  slug: "free-trial",
                  type: PlanType.TRIAL,
                  priceInr: 0,
                  interval: BillingInterval.NONE,
                  credits: 5,
                  trialDays: 7,
                  features: ["5 Live Classes", "Community Access", "Standard Video Quality"],
                },
              });
            }
            planId = trialPlan.id;
          }

          const sub = await tx.subscription.create({
            data: {
              userId,
              planId: planId!,
              status: SubscriptionStatus.TRIALING,
              currentPeriodStart: now,
              currentPeriodEnd: trialEnds,
              trialEndsAt: trialEnds,
              creditsRemaining: 5,
            },
          });

          await tx.creditLedger.create({
            data: {
              userId,
              subscriptionId: sub.id,
              delta: 5,
              balanceAfter: 5,
              reason: CreditReason.PURCHASE,
              note: "Welcome 7-Day Free Trial (5 credits)",
            },
          });

          await tx.activationEvent.upsert({
            where: {
              userId_type: {
                userId,
                type: ActivationEventType.TRIAL_STARTED,
              },
            },
            create: {
              userId,
              type: ActivationEventType.TRIAL_STARTED,
              metadata: { trialStartedAt: now.toISOString(), credits: 5 },
            },
            update: {},
          });
        }

        if (consent) {
          await tx.marketingConsent.upsert({
            where: { userId },
            create: {
              userId,
              emailMarketingOptIn: Boolean(consent.marketingOptIn),
              whatsappOptIn: Boolean(consent.whatsappOptIn),
              consentedAt: now,
            },
            update: {
              emailMarketingOptIn: Boolean(consent.marketingOptIn),
              whatsappOptIn: Boolean(consent.whatsappOptIn),
              consentedAt: now,
            },
          });
        }

        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: updateData,
        });

        const updatedProgress = await tx.onboardingProgress.upsert({
          where: { userId },
          create: {
            userId,
            flowVersion: "v1",
            status: OnboardingStatus.SKIPPED,
            currentStep: "summary",
            skippedAt: now,
            completedAt: now,
          },
          update: {
            status: OnboardingStatus.SKIPPED,
            currentStep: "summary",
            skippedAt: now,
            completedAt: now,
          },
        });

        await tx.activationEvent.upsert({
          where: {
            userId_type: {
              userId,
              type: ActivationEventType.ONBOARDING_SKIPPED,
            },
          },
          create: {
            userId,
            type: ActivationEventType.ONBOARDING_SKIPPED,
            metadata: { skippedAt: now.toISOString() },
          },
          update: {},
        });

        return { user: updatedUser, progress: updatedProgress, trialActivated };
      },
      {
        maxWait: 15000,
        timeout: 35000,
      }
    );

    prisma.auditLog
      .create({
        data: {
          actorId: userId,
          action: "onboarding.skipped",
          entity: "user",
          entityId: userId,
          metadata: { trialActivated: result.trialActivated },
        },
      })
      .catch((err) => {
        console.warn("[OnboardingRepository] Failed to write auditLog", err);
      });

    return result;
  }

  async restartOnboarding(userId: string) {
    return prisma.onboardingProgress.upsert({
      where: { userId },
      create: {
        userId,
        flowVersion: "v1",
        status: OnboardingStatus.IN_PROGRESS,
        currentStep: "experience",
      },
      update: {
        status: OnboardingStatus.IN_PROGRESS,
        currentStep: "experience",
        completedAt: null,
        skippedAt: null,
      },
    });
  }

  async getLimitations(userId: string) {
    const record = await prisma.userLimitations.findUnique({
      where: { userId },
    });
    if (!record) return null;

    try {
      return decryptLimitations(record);
    } catch {
      return null;
    }
  }
}

export const onboardingRepository = new OnboardingRepository();
