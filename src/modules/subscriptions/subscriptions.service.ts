import { subscriptionsRepository } from "./subscriptions.repository";
import type { Plan, Subscription } from "@prisma/client";

export interface ProrationResult {
  proratedCreditPaise: number;
  remainingDays: number;
  totalDays: number;
  isUpgrade: boolean;
  explanation: string;
}

export class SubscriptionsService {
  /**
   * Calculates unused paid time from current plan as monetary credit against a new plan.
   * Free trials yield 0 monetary credit.
   */
  calculateProration(
    currentSubscription: (Subscription & { plan: Plan }) | null,
    targetPlan: Plan
  ): ProrationResult {
    if (!currentSubscription || currentSubscription.status !== "ACTIVE") {
      return {
        proratedCreditPaise: 0,
        remainingDays: 0,
        totalDays: 0,
        isUpgrade: false,
        explanation: "No active paid subscription to prorate.",
      };
    }

    const currentPlan = currentSubscription.plan;

    // Trials have no monetary value
    if (currentPlan.type === "TRIAL" || currentPlan.priceInr <= 0) {
      return {
        proratedCreditPaise: 0,
        remainingDays: 0,
        totalDays: 0,
        isUpgrade: false,
        explanation: "Free trial does not generate monetary credit.",
      };
    }

    // Class pack credits carry over as classes, not monetary proration
    if (currentPlan.type === "CLASS_PACK") {
      return {
        proratedCreditPaise: 0,
        remainingDays: 0,
        totalDays: 0,
        isUpgrade: false,
        explanation: "Class pack session credits remain in your balance.",
      };
    }

    const now = Date.now();
    const periodStart = new Date(currentSubscription.currentPeriodStart).getTime();
    const periodEnd = new Date(currentSubscription.currentPeriodEnd).getTime();

    if (now >= periodEnd || periodEnd <= periodStart) {
      return {
        proratedCreditPaise: 0,
        remainingDays: 0,
        totalDays: 0,
        isUpgrade: false,
        explanation: "Current subscription period has completed.",
      };
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(1, Math.round((periodEnd - periodStart) / msPerDay));
    const remainingDays = Math.max(0, Math.round((periodEnd - now) / msPerDay));

    if (remainingDays <= 0) {
      return {
        proratedCreditPaise: 0,
        remainingDays: 0,
        totalDays,
        isUpgrade: false,
        explanation: "Less than 24 hours remaining in current period.",
      };
    }

    // Daily rate in paise
    const dailyRatePaise = currentPlan.priceInr / totalDays;
    const rawCredit = Math.floor(dailyRatePaise * remainingDays);

    // Prorated credit cannot exceed either the current plan price or the target plan price
    const proratedCreditPaise = Math.min(rawCredit, currentPlan.priceInr, targetPlan.priceInr);

    return {
      proratedCreditPaise,
      remainingDays,
      totalDays,
      isUpgrade: targetPlan.priceInr > currentPlan.priceInr,
      explanation: `${remainingDays} unused days credited from ${currentPlan.name} (₹${(proratedCreditPaise / 100).toFixed(0)})`,
    };
  }

  /**
   * Computes the new billing period start and end dates based on plan configuration.
   */
  calculatePeriodDates(plan: Plan, fromDate = new Date()): { start: Date; end: Date } {
    const start = new Date(fromDate);
    const end = new Date(fromDate);

    if (plan.interval === "YEAR") {
      end.setFullYear(end.getFullYear() + 1);
    } else if (plan.interval === "MONTH") {
      end.setMonth(end.getMonth() + 1);
    } else if (plan.type === "CLASS_PACK") {
      const validityDays = plan.validityDays || 180;
      end.setDate(end.getDate() + validityDays);
    } else if (plan.type === "TRIAL") {
      const trialDays = plan.trialDays || 7;
      end.setDate(end.getDate() + trialDays);
    } else {
      end.setDate(end.getDate() + 30);
    }

    return { start, end };
  }
}

export const subscriptionsService = new SubscriptionsService();
