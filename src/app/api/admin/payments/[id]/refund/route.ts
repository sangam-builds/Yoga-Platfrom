import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { runTransaction } from "@/lib/db/transaction";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { RefundPaymentSchema } from "@/modules/payments/payments.schema";
import { getPaymentProvider } from "@/modules/payments/providers";

export const POST = createApiHandler(
  async (request: Request, context?: { params?: Promise<{ id: string }> }) => {
    const { dbUser } = await requireAdmin();

    const params = context?.params ? await context.params : null;
    const paymentId = params?.id;
    if (!paymentId) {
      throw new BadRequestError("Payment ID parameter is required");
    }

    const body = await request.json();
    const input = RefundPaymentSchema.parse(body);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { refunds: true, plan: true, user: true },
    });

    if (!payment) {
      throw new NotFoundError("Payment record not found");
    }

    if (payment.status !== "SUCCEEDED" && payment.status !== "PARTIALLY_REFUNDED") {
      throw new BadRequestError(`Cannot refund a payment with status '${payment.status}'`);
    }

    if (!payment.providerPaymentId) {
      throw new BadRequestError("Payment does not have a valid gateway transaction ID");
    }

    const alreadyRefundedPaise = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    const maxRefundablePaise = payment.amount - alreadyRefundedPaise;

    if (maxRefundablePaise <= 0) {
      throw new BadRequestError("Payment has already been fully refunded.");
    }

    const refundAmountPaise = input.amount ? Math.min(input.amount, maxRefundablePaise) : maxRefundablePaise;

    // 1. Execute refund with Razorpay gateway
    const provider = getPaymentProvider();
    const providerRefund = await provider.refundPayment({
      paymentId: payment.providerPaymentId,
      amount: refundAmountPaise,
      notes: {
        reason: input.reason,
        adminId: dbUser.id,
      },
    });

    // 2. Atomically persist refund in database
    const newTotalRefunded = alreadyRefundedPaise + refundAmountPaise;
    const newStatus = newTotalRefunded >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

    const refundRecord = await runTransaction(async (tx) => {
      const createdRefund = await tx.refund.create({
        data: {
          paymentId: payment.id,
          amount: refundAmountPaise,
          reason: input.reason,
          status: "PROCESSED",
          providerRefundId: providerRefund.id,
          processedById: dbUser.id,
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      await tx.auditLog.create({
        data: {
          actorId: dbUser.id,
          action: "refund.create",
          entity: "Payment",
          entityId: payment.id,
          metadata: {
            amountPaise: refundAmountPaise,
            refundId: createdRefund.id,
            providerRefundId: providerRefund.id,
            reason: input.reason,
            newStatus,
          },
        },
      });

      return createdRefund;
    });

    return NextResponse.json({
      success: true,
      refund: refundRecord,
      newStatus,
    });
  }
);
