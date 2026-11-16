import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getPaymentProvider } from "./providers";
import { paymentsService } from "./payments.service";

export interface ReconciliationSummary {
  checkedCount: number;
  confirmedCount: number;
  failedCount: number;
  errorsCount: number;
}

export class PaymentsReconciliationService {
  /**
   * Reconciles payments that have remained PENDING for over 30 minutes.
   * Compares state with Razorpay and confirms or fails them idempotently.
   */
  async reconcilePendingPayments(olderThanMinutes = 30): Promise<ReconciliationSummary> {
    const cutoffDate = new Date(Date.now() - olderThanMinutes * 60 * 1000);

    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: cutoffDate },
      },
      take: 50,
      include: { plan: true },
    });

    const summary: ReconciliationSummary = {
      checkedCount: pendingPayments.length,
      confirmedCount: 0,
      failedCount: 0,
      errorsCount: 0,
    };

    if (pendingPayments.length === 0) {
      return summary;
    }

    const provider = getPaymentProvider();

    for (const payment of pendingPayments) {
      try {
        if (!payment.providerOrderId) continue;

        // If providerPaymentId exists, check its status
        if (payment.providerPaymentId) {
          const providerPayment = await provider.fetchPayment(payment.providerPaymentId);
          if (providerPayment.status === "captured") {
            await paymentsService.confirmPaymentAtomically({
              paymentId: payment.id,
              providerPaymentId: providerPayment.id,
              method: providerPayment.method || "card",
              rawStatus: providerPayment.status,
              actorId: undefined, // System reconciliation
            });
            summary.confirmedCount++;
            continue;
          }
        }

        // If older than 2 hours without payment id, mark failed
        const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);
        if (payment.createdAt <= twoHoursAgo) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              failureReason: "Abandoned checkout (reconciliation expired)",
            },
          });
          summary.failedCount++;
        }
      } catch (err) {
        logger.error({ err, paymentId: payment.id }, "Error reconciling payment");
        summary.errorsCount++;
      }
    }

    logger.info(summary, "Payment reconciliation run completed");
    return summary;
  }
}

export const paymentsReconciliationService = new PaymentsReconciliationService();
