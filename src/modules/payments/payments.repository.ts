import { prisma } from "@/lib/prisma";
import type { PrismaTransaction } from "@/lib/db/transaction";
import type { Payment, PaymentStatus, PaymentProvider } from "@prisma/client";

export class PaymentsRepository {
  async createPendingPayment(
    data: {
      userId: string;
      planId: string;
      subscriptionId?: string | null;
      provider: PaymentProvider;
      providerOrderId: string;
      amount: number; // In paise
      taxAmount: number;
      discountAmount: number;
      currency?: string;
    },
    tx?: PrismaTransaction
  ): Promise<Payment> {
    const db = tx || prisma;
    return db.payment.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        subscriptionId: data.subscriptionId,
        provider: data.provider,
        providerOrderId: data.providerOrderId,
        status: "PENDING",
        amount: data.amount,
        taxAmount: data.taxAmount,
        discountAmount: data.discountAmount,
        currency: data.currency || "INR",
      },
    });
  }

  async findByOrderId(orderId: string): Promise<(Payment & { plan: any; user: any }) | null> {
    return prisma.payment.findUnique({
      where: { providerOrderId: orderId },
      include: {
        plan: true,
        user: true,
        subscription: true,
      },
    });
  }

  async findById(id: string): Promise<(Payment & { plan: any; user: any; refunds: any[] }) | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        plan: true,
        user: true,
        subscription: true,
        refunds: true,
        couponRedemption: { include: { coupon: true } },
      },
    });
  }

  async listUserPayments(userId: string, limit = 20, cursor?: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        plan: { select: { name: true, interval: true, type: true } },
        refunds: { select: { amount: true, status: true, createdAt: true } },
      },
    });
  }

  async findPendingPaymentsOlderThan(cutoffDate: Date): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: cutoffDate },
      },
      take: 50,
      include: { plan: true },
    });
  }
}

export const paymentsRepository = new PaymentsRepository();
