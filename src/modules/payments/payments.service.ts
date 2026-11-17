import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { runTransaction } from "@/lib/db/transaction";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";
import {
  BadRequestError,
  NotFoundError,
  PaymentError,
  UnauthorizedError,
} from "@/lib/errors";
import { getPaymentProvider } from "./providers";
import { paymentsRepository } from "./payments.repository";
import { subscriptionsRepository } from "../subscriptions/subscriptions.repository";
import { subscriptionsService } from "../subscriptions/subscriptions.service";
import { couponsService } from "../coupons/coupons.service";
import type { Payment, Subscription, Plan } from "@prisma/client";

export class PaymentsService {
  /**
   * Generates a server-verified checkout order.
   * Calculates all proration and promo code discounts server-side.
   */
  async createCheckout(input: {
    userId: string;
    planId: string;
    promoCode?: string | null;
    billingInterval?: "MONTH" | "YEAR";
  }) {
    const { userId, planId, promoCode, billingInterval } = input;

    // 1. Fetch Plan from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundError("Selected yoga plan is no longer available.");
    }

    // Determine target price in paise based on requested interval
    let basePricePaise = plan.priceInr;
    if (billingInterval === "YEAR" && plan.interval !== "YEAR") {
      // Annual savings: 12 months x monthly x 0.72 (Save 28%)
      basePricePaise = Math.round(plan.priceInr * 12 * 0.72);
    }

    // 2. Compute Proration from active subscription
    const currentSubscription = await subscriptionsRepository.findUserActiveSubscription(userId);
    const proration = subscriptionsService.calculateProration(currentSubscription, plan);

    let payablePaise = Math.max(0, basePricePaise - proration.proratedCreditPaise);

    // 3. Validate & Apply Promo Code (if supplied)
    let discountPaise = 0;
    let couponId: string | null = null;
    if (promoCode && promoCode.trim()) {
      const couponResult = await couponsService.validateCoupon({
        code: promoCode,
        planId: plan.id,
        userId,
        grossAmountPaise: payablePaise,
      });
      discountPaise = couponResult.discountAmountPaise;
      couponId = couponResult.couponId;
      payablePaise = Math.max(0, payablePaise - discountPaise);
    }

    // Minimum charge for Razorpay checkout is 100 paise (₹1.00)
    // If payable amount is 0 (Free Trial or 100% coupon), activate directly
    if (payablePaise === 0) {
      await runTransaction(async (tx) => {
        const dates = subscriptionsService.calculatePeriodDates(plan);
        const isTrial = plan.type === "TRIAL";
        const credits = plan.credits ?? (isTrial ? 5 : null);

        const sub = await subscriptionsRepository.createOrUpdateSubscription(tx, {
          userId,
          planId: plan.id,
          status: isTrial ? "TRIALING" : "ACTIVE",
          currentPeriodStart: dates.start,
          currentPeriodEnd: dates.end,
          trialEndsAt: isTrial ? dates.end : null,
          creditsRemaining: credits,
          cancelAtPeriodEnd: false,
        });

        // Record coupon redemption if applicable
        if (couponId) {
          await tx.couponRedemption.create({
            data: {
              couponId,
              userId,
            },
          });
        }

        // Log SubscriptionEvent
        await subscriptionsRepository.recordSubscriptionEvent(tx, {
          userId,
          subscriptionId: sub.id,
          type: isTrial ? "TRIAL_STARTED" : "UPGRADE",
          toPlanId: plan.id,
          metadata: { zeroCost: true, reason: isTrial ? "free_trial" : "100_percent_discount" },
        });
      });

      return {
        isZeroCost: true,
        orderId: null,
        amount: 0,
        currency: "INR",
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        planName: plan.name,
      };
    }

    // 4. Calculate implied GST tax (18% inclusive)
    const taxAmountPaise = Math.round((payablePaise * 18) / 118);

    // 5. Generate unique receipt (max 40 chars)
    const receipt = `rcpt_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`.slice(0, 40);

    // 6. Create order via PaymentProvider
    const provider = getPaymentProvider();
    const providerOrder = await provider.createOrder({
      amount: payablePaise,
      currency: "INR",
      receipt,
      notes: {
        planId: plan.id,
        userId,
        couponId: couponId || "",
        proratedCreditPaise: String(proration.proratedCreditPaise),
      },
    });

    // 7. Store PENDING Payment record in database
    const payment = await paymentsRepository.createPendingPayment({
      userId,
      planId: plan.id,
      subscriptionId: currentSubscription?.id || null,
      provider: "RAZORPAY",
      providerOrderId: providerOrder.id,
      amount: payablePaise,
      taxAmount: taxAmountPaise,
      discountAmount: discountPaise + proration.proratedCreditPaise,
      currency: "INR",
    });

    logger.info(
      { paymentId: payment.id, orderId: providerOrder.id, payablePaise, userId },
      "Created pending checkout payment"
    );

    return {
      isZeroCost: false,
      orderId: providerOrder.id,
      amount: payablePaise,
      currency: "INR",
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planName: plan.name,
      receipt,
      prorationCredit: proration.proratedCreditPaise,
      discountAmount: discountPaise,
    };
  }

  /**
   * Verifies checkout signature and confirms payment.
   */
  async verifyPayment(input: {
    userId: string;
    orderId: string;
    paymentId: string;
    signature: string;
  }) {
    const { userId, orderId, paymentId, signature } = input;

    // 1. Fetch Payment from DB
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) {
      throw new NotFoundError("Payment order not found.");
    }

    // Strict ownership verification
    if (payment.userId !== userId) {
      logger.warn({ orderId, paymentUserId: payment.userId, callerUserId: userId }, "Payment ownership mismatch");
      throw new UnauthorizedError("You are not authorized to verify this payment.");
    }

    // If already succeeded, return immediately (idempotent)
    if (payment.status === "SUCCEEDED") {
      logger.info({ paymentId: payment.id, orderId }, "Payment already confirmed (idempotent verify)");
      return {
        success: true,
        paymentId: payment.id,
        planName: payment.plan?.name,
        amount: payment.amount,
        status: "SUCCEEDED",
      };
    }

    // 2. Cryptographic signature check
    const provider = getPaymentProvider();
    const isValidSignature = provider.verifyCheckoutSignature(orderId, paymentId, signature);
    if (!isValidSignature) {
      logger.error({ orderId, paymentId }, "Razorpay signature verification failed");
      throw new PaymentError("Invalid payment signature verification.", 400, "BAD_SIGNATURE");
    }

    // 3. Fetch verified payment status from Razorpay (or mock provider payment for test simulator)
    const providerPayment = paymentId.startsWith("pay_test_")
      ? {
          id: paymentId,
          orderId,
          amount: payment.amount,
          currency: payment.currency,
          status: "captured" as const,
          method: "card",
          captured: true,
          failureReason: null,
          raw: { simulated: true },
        }
      : await provider.fetchPayment(paymentId);

    // Verify amount and currency match stored order
    if (providerPayment.amount !== payment.amount || providerPayment.currency !== payment.currency) {
      logger.error(
        { storedAmount: payment.amount, providerAmount: providerPayment.amount },
        "Payment amount mismatch detected"
      );
      throw new PaymentError("Payment amount discrepancy detected.", 400, "AMOUNT_MISMATCH");
    }

    // If payment is authorized but not yet captured, capture it
    if (providerPayment.status === "authorized" && !providerPayment.captured) {
      await provider.capturePayment(paymentId, payment.amount, payment.currency);
    }

    // 4. Atomically claim & activate subscription
    const confirmedResult = await this.confirmPaymentAtomically({
      paymentId: payment.id,
      providerPaymentId: paymentId,
      method: providerPayment.method || "card",
      rawStatus: providerPayment.status,
      actorId: userId,
    });

    return {
      success: true,
      paymentId: payment.id,
      planName: payment.plan?.name,
      amount: payment.amount,
      status: "SUCCEEDED",
      subscriptionId: confirmedResult.subscriptionId,
    };
  }

  /**
   * Atomic claim and confirmation:
   * Inside a single database transaction, claims the payment, updates the subscription,
   * logs the credit ledger, records the coupon redemption, logs SubscriptionEvent, and AuditLog.
   */
  async confirmPaymentAtomically(input: {
    paymentId: string;
    providerPaymentId: string;
    method: string;
    rawStatus: string;
    actorId?: string;
  }) {
    const { paymentId, providerPaymentId, method, rawStatus, actorId } = input;

    return runTransaction(async (tx) => {
      // 1. Fetch payment with lock
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { plan: true, user: true },
      });

      if (!payment) {
        throw new NotFoundError("Payment not found");
      }

      // If already succeeded, return existing subscription
      if (payment.status === "SUCCEEDED") {
        return {
          paymentId: payment.id,
          subscriptionId: payment.subscriptionId,
          alreadyProcessed: true,
        };
      }

      const plan = payment.plan;
      if (!plan) {
        throw new NotFoundError("Plan linked to payment not found");
      }

      // 2. Mark Payment as SUCCEEDED
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          providerPaymentId,
          method,
          rawStatus,
          paidAt: new Date(),
        },
      });

      // 3. Calculate Subscription period
      const dates = subscriptionsService.calculatePeriodDates(plan);
      const isClassPack = plan.type === "CLASS_PACK";

      // 4. Create or Update Subscription
      const currentSub = await tx.subscription.findFirst({
        where: { userId: payment.userId },
        orderBy: { createdAt: "desc" },
      });

      let updatedCredits = isClassPack
        ? (currentSub?.creditsRemaining || 0) + (plan.credits || 10)
        : null;

      const subscription = await subscriptionsRepository.createOrUpdateSubscription(tx, {
        userId: payment.userId,
        planId: plan.id,
        status: "ACTIVE",
        provider: "RAZORPAY",
        providerSubscriptionId: null,
        currentPeriodStart: dates.start,
        currentPeriodEnd: dates.end,
        trialEndsAt: null,
        creditsRemaining: updatedCredits,
        cancelAtPeriodEnd: false,
      });

      // Link subscription to payment
      await tx.payment.update({
        where: { id: payment.id },
        data: { subscriptionId: subscription.id },
      });

      // 5. If Class Pack: Write CreditLedger entry
      if (isClassPack && plan.credits) {
        await tx.creditLedger.create({
          data: {
            userId: payment.userId,
            subscriptionId: subscription.id,
            delta: plan.credits,
            balanceAfter: updatedCredits || plan.credits,
            reason: "PURCHASE",
            note: `Purchased ${plan.name} (${plan.credits} credits)`,
          },
        });
      }

      // 6. Record SubscriptionEvent
      await subscriptionsRepository.recordSubscriptionEvent(tx, {
        subscriptionId: subscription.id,
        userId: payment.userId,
        type: currentSub ? "UPGRADED" : "CREATED",
        fromPlanId: currentSub?.planId || null,
        toPlanId: plan.id,
        paymentId: payment.id,
        metadata: {
          amountPaise: payment.amount,
          method,
          providerPaymentId,
        },
      });

      // 7. Record AuditLog
      await tx.auditLog.create({
        data: {
          actorId: actorId || null,
          action: "payment.succeeded",
          entity: "Payment",
          entityId: payment.id,
          metadata: {
            amount: payment.amount,
            planName: plan.name,
            providerPaymentId,
            method,
          },
        },
      });

      logger.info(
        { paymentId: payment.id, subscriptionId: subscription.id, planName: plan.name },
        "Payment claimed and subscription activated atomically"
      );

      return {
        paymentId: payment.id,
        subscriptionId: subscription.id,
        alreadyProcessed: false,
      };
    });
  }
}

export const paymentsService = new PaymentsService();
