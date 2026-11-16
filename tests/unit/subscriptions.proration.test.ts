import { describe, it } from "node:test";
import assert from "node:assert";
import { subscriptionsService } from "../../src/modules/subscriptions/subscriptions.service";
import type { Plan, Subscription } from "@prisma/client";

describe("Subscription Proration Engine", () => {
  const targetAnnualPlan: Plan = {
    id: "plan_annual",
    slug: "annual-harmony",
    name: "Annual Harmony",
    description: null,
    type: "SUBSCRIPTION",
    interval: "YEAR",
    priceInr: 1299900, // ₹12,999.00
    priceUsd: null,
    credits: null,
    validityDays: null,
    trialDays: 0,
    recordingAccessDays: 365,
    features: ["All classes"],
    razorpayPlanId: null,
    stripePriceId: null,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should give 0 monetary credit for trial subscription upgrade", () => {
    const trialSub = {
      id: "sub_trial",
      userId: "user_1",
      planId: "plan_trial",
      corporateAccountId: null,
      status: "TRIALING" as const,
      provider: null,
      providerSubscriptionId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      creditsRemaining: 5,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      pausedFrom: null,
      pausedUntil: null,
      failedPaymentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: {
        id: "plan_trial",
        slug: "free-trial",
        name: "7-Day Free Trial",
        description: null,
        type: "TRIAL" as const,
        interval: "NONE" as const,
        priceInr: 0,
        priceUsd: null,
        credits: 5,
        validityDays: null,
        trialDays: 7,
        recordingAccessDays: 7,
        features: [],
        razorpayPlanId: null,
        stripePriceId: null,
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const result = subscriptionsService.calculateProration(trialSub, targetAnnualPlan);
    assert.strictEqual(result.proratedCreditPaise, 0);
  });

  it("should calculate correct daily proration for active monthly subscription", () => {
    const now = Date.now();
    const periodStart = new Date(now - 15 * 24 * 60 * 60 * 1000); // 15 days ago
    const periodEnd = new Date(now + 15 * 24 * 60 * 60 * 1000); // 15 days left (50% remaining)

    const monthlySub = {
      id: "sub_monthly",
      userId: "user_2",
      planId: "plan_monthly",
      corporateAccountId: null,
      status: "ACTIVE" as const,
      provider: "RAZORPAY" as const,
      providerSubscriptionId: null,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      trialEndsAt: null,
      creditsRemaining: null,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      pausedFrom: null,
      pausedUntil: null,
      failedPaymentCount: 0,
      createdAt: periodStart,
      updatedAt: periodStart,
      plan: {
        id: "plan_monthly",
        slug: "monthly-flow",
        name: "Monthly Flow",
        description: null,
        type: "SUBSCRIPTION" as const,
        interval: "MONTH" as const,
        priceInr: 149900, // ₹1,499.00
        priceUsd: null,
        credits: null,
        validityDays: null,
        trialDays: 0,
        recordingAccessDays: 7,
        features: [],
        razorpayPlanId: null,
        stripePriceId: null,
        isActive: true,
        sortOrder: 1,
        createdAt: periodStart,
        updatedAt: periodStart,
      },
    };

    const result = subscriptionsService.calculateProration(monthlySub, targetAnnualPlan);
    assert.ok(result.proratedCreditPaise > 0);
    // Approximately half of 149900 = ~74950 paise
    assert.ok(result.proratedCreditPaise >= 70000 && result.proratedCreditPaise <= 80000);
    assert.strictEqual(result.isUpgrade, true);
  });

  it("should not prorate monetary credits for class packs", () => {
    const classPackSub = {
      id: "sub_pack",
      userId: "user_3",
      planId: "plan_pack",
      corporateAccountId: null,
      status: "ACTIVE" as const,
      provider: "RAZORPAY" as const,
      providerSubscriptionId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      trialEndsAt: null,
      creditsRemaining: 8,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      pausedFrom: null,
      pausedUntil: null,
      failedPaymentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      plan: {
        id: "plan_pack",
        slug: "10-class-pack",
        name: "10-Class Pack",
        description: null,
        type: "CLASS_PACK" as const,
        interval: "NONE" as const,
        priceInr: 199900,
        priceUsd: null,
        credits: 10,
        validityDays: 180,
        trialDays: 0,
        recordingAccessDays: 0,
        features: [],
        razorpayPlanId: null,
        stripePriceId: null,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    const result = subscriptionsService.calculateProration(classPackSub, targetAnnualPlan);
    assert.strictEqual(result.proratedCreditPaise, 0);
  });
});
