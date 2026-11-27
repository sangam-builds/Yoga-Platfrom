import { prisma } from "../../lib/prisma.ts";
import { ActivationEventType, OnboardingStatus } from "@prisma/client";

export interface OnboardingFunnelMetrics {
  totalStarted: number;
  totalCompleted: number;
  totalSkipped: number;
  completionRate: string;
  totalTrialsStarted: number;
  trialActivationRate: string;
  firstBookingShown: number;
  firstBookingMade: number;
  firstBookingConversionRate: string;
  checklistDismissed: number;
  stepBreakdown: Record<string, number>;
}

export async function getOnboardingFunnelMetrics(
  startDate?: Date
): Promise<OnboardingFunnelMetrics> {
  const dateFilter = startDate ? { gte: startDate } : undefined;

  // 1. Aggregate counts from OnboardingProgress
  const [totalStarted, totalCompleted, totalSkipped, progressRows] =
    await Promise.all([
      prisma.onboardingProgress.count({
        where: dateFilter ? { startedAt: dateFilter } : undefined,
      }),
      prisma.onboardingProgress.count({
        where: {
          status: OnboardingStatus.COMPLETED,
          ...(dateFilter ? { completedAt: dateFilter } : {}),
        },
      }),
      prisma.onboardingProgress.count({
        where: {
          status: OnboardingStatus.SKIPPED,
          ...(dateFilter ? { skippedAt: dateFilter } : {}),
        },
      }),
      prisma.onboardingProgress.groupBy({
        by: ["currentStep"],
        _count: { _all: true },
        where: dateFilter ? { startedAt: dateFilter } : undefined,
      }),
    ]);

  // 2. Aggregate activation events
  const eventCounts = await prisma.activationEvent.groupBy({
    by: ["type"],
    _count: { _all: true },
    where: dateFilter ? { createdAt: dateFilter } : undefined,
  });

  const getEventCount = (type: ActivationEventType): number => {
    const found = eventCounts.find((e) => e.type === type);
    return found ? found._count._all : 0;
  };

  const totalTrialsStarted = getEventCount(ActivationEventType.TRIAL_STARTED);
  const firstBookingShown = getEventCount(ActivationEventType.FIRST_BOOKING_SHOWN);
  const firstBookingMade = getEventCount(ActivationEventType.FIRST_BOOKING_MADE);
  const checklistDismissed = getEventCount(ActivationEventType.CHECKLIST_DISMISSED);

  // Step breakdown
  const stepBreakdown: Record<string, number> = {};
  progressRows.forEach((row) => {
    stepBreakdown[row.currentStep] = row._count._all;
  });

  // Calculate percentages safely
  const completionRate =
    totalStarted > 0
      ? `${Math.round((totalCompleted / totalStarted) * 100)}%`
      : "0%";

  const trialActivationRate =
    totalStarted > 0
      ? `${Math.round((totalTrialsStarted / totalStarted) * 100)}%`
      : "0%";

  const firstBookingConversionRate =
    firstBookingShown > 0
      ? `${Math.round((firstBookingMade / firstBookingShown) * 100)}%`
      : "0%";

  return {
    totalStarted,
    totalCompleted,
    totalSkipped,
    completionRate,
    totalTrialsStarted,
    trialActivationRate,
    firstBookingShown,
    firstBookingMade,
    firstBookingConversionRate,
    checklistDismissed,
    stepBreakdown,
  };
}
