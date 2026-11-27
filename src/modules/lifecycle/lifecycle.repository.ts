import { prisma } from "../../lib/prisma.ts";

export class LifecycleRepository {
  async getUserLifecycleData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        onboardingCompleted: true,
        firstBookingAt: true,
        checklistDismissedAt: true,
        trialStartedAt: true,
        trialEndsAt: true,
        onboardingProgress: true,
        subscriptions: {
          where: {
            status: { in: ["ACTIVE", "TRIALING"] },
          },
          select: { id: true, status: true },
        },
      },
    });

    if (!user) return null;

    const bookingsCount = await prisma.booking.count({
      where: {
        userId,
        status: { in: ["BOOKED", "COMPLETED"] },
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        onboardingCompleted: user.onboardingCompleted,
        firstBookingAt: user.firstBookingAt,
        checklistDismissedAt: user.checklistDismissedAt,
        trialStartedAt: user.trialStartedAt,
        trialEndsAt: user.trialEndsAt,
      },
      onboardingProgress: user.onboardingProgress
        ? {
            status: user.onboardingProgress.status,
            currentStep: user.onboardingProgress.currentStep,
            flowVersion: user.onboardingProgress.flowVersion,
            completedAt: user.onboardingProgress.completedAt,
            skippedAt: user.onboardingProgress.skippedAt,
          }
        : null,
      bookingsCount,
      hasActiveSubscription: user.subscriptions.length > 0,
    };
  }

  async dismissChecklist(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { checklistDismissedAt: new Date() },
    });
  }
}

export const lifecycleRepository = new LifecycleRepository();
