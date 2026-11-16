import { prisma } from "@/lib/prisma";
import type { PrismaTransaction } from "@/lib/db/transaction";
import type { Subscription, SubscriptionEvent, SubscriptionStatus, PaymentProvider } from "@prisma/client";

export class SubscriptionsRepository {
  async findUserActiveSubscription(userId: string): Promise<Subscription & { plan: any } | null> {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ["ACTIVE", "TRIALING", "PAUSED", "PAST_DUE"] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findSubscriptionById(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async createOrUpdateSubscription(
    tx: PrismaTransaction,
    data: {
      userId: string;
      planId: string;
      status: SubscriptionStatus;
      provider?: PaymentProvider;
      providerSubscriptionId?: string | null;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      trialEndsAt?: Date | null;
      creditsRemaining?: number | null;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<Subscription> {
    // Check if an existing subscription row can be updated
    const existing = await tx.subscription.findFirst({
      where: { userId: data.userId },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return tx.subscription.update({
        where: { id: existing.id },
        data: {
          planId: data.planId,
          status: data.status,
          provider: data.provider,
          providerSubscriptionId: data.providerSubscriptionId,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          trialEndsAt: data.trialEndsAt,
          creditsRemaining: data.creditsRemaining,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
          failedPaymentCount: 0,
        },
      });
    }

    return tx.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status,
        provider: data.provider,
        providerSubscriptionId: data.providerSubscriptionId,
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        trialEndsAt: data.trialEndsAt,
        creditsRemaining: data.creditsRemaining,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
      },
    });
  }

  async recordSubscriptionEvent(
    tx: PrismaTransaction,
    data: {
      subscriptionId: string;
      userId: string;
      type: string;
      fromPlanId?: string | null;
      toPlanId: string;
      paymentId?: string | null;
      metadata?: any;
    }
  ): Promise<SubscriptionEvent> {
    return tx.subscriptionEvent.create({
      data: {
        subscriptionId: data.subscriptionId,
        userId: data.userId,
        type: data.type,
        fromPlanId: data.fromPlanId,
        toPlanId: data.toPlanId,
        paymentId: data.paymentId,
        metadata: data.metadata,
      },
    });
  }
}

export const subscriptionsRepository = new SubscriptionsRepository();
