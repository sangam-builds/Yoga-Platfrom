import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { BadRequestError } from "@/lib/errors";
import { getPaymentProvider } from "./providers";
import { paymentsService } from "./payments.service";

export interface WebhookProcessingResult {
  status: "processed" | "skipped" | "ignored";
  eventType: string;
  eventId: string;
  message?: string;
}

export class PaymentsWebhookHandler {
  /**
   * Processes incoming Razorpay webhooks idempotently.
   */
  async handleWebhook(rawBody: string, signature: string, eventIdHeader?: string | null): Promise<WebhookProcessingResult> {
    const provider = getPaymentProvider();

    // 1. Verify HMAC SHA256 webhook signature
    const isValid = provider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn({ signatureHeaderPresent: Boolean(signature) }, "Webhook signature mismatch rejected");
      throw new BadRequestError("Invalid webhook signature");
    }

    // 2. Parse JSON payload
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      throw new BadRequestError("Invalid JSON body");
    }

    const eventType: string = event.event;
    // Razorpay event id comes either in header 'x-razorpay-event-id' or payload
    const eventId: string = eventIdHeader || event.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    logger.info({ eventType, eventId }, "Processing Razorpay webhook event");

    // 3. Idempotency Check via WebhookEvent table
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: {
        provider_eventId: {
          provider: "razorpay",
          eventId,
        },
      },
    });

    if (existingEvent && existingEvent.processedAt) {
      logger.info({ eventId, eventType }, "Webhook event already processed (idempotent skip)");
      return {
        status: "skipped",
        eventType,
        eventId,
        message: "Duplicate event already processed",
      };
    }

    // Create or update WebhookEvent entry
    const webhookRecord = await prisma.webhookEvent.upsert({
      where: {
        provider_eventId: {
          provider: "razorpay",
          eventId,
        },
      },
      update: {
        payload: event,
      },
      create: {
        provider: "razorpay",
        eventId,
        type: eventType,
        payload: event,
      },
    });

    try {
      // 4. Dispatch based on event type
      switch (eventType) {
        case "payment.captured":
        case "order.paid": {
          await this.handlePaymentCaptured(event);
          break;
        }

        case "payment.authorized": {
          await this.handlePaymentAuthorized(event);
          break;
        }

        case "payment.failed": {
          await this.handlePaymentFailed(event);
          break;
        }

        case "refund.processed": {
          await this.handleRefundProcessed(event);
          break;
        }

        default: {
          logger.info({ eventType }, "Unhandled event type logged and acknowledged");
        }
      }

      // Mark webhook as processed
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          processedAt: new Date(),
          error: null,
        },
      });

      return {
        status: "processed",
        eventType,
        eventId,
      };
    } catch (err: any) {
      logger.error({ err, eventId, eventType }, "Failed to process webhook event");
      await prisma.webhookEvent.update({
        where: { id: webhookRecord.id },
        data: {
          error: err.message || "Unknown webhook processing error",
        },
      });
      throw err; // Re-throw to trigger 500 response so Razorpay retries
    }
  }

  private async handlePaymentCaptured(event: any) {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId || !paymentId) {
      logger.warn({ eventPayload: event.payload }, "payment.captured missing order_id or payment_id");
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { providerOrderId: orderId },
    });

    if (!payment) {
      logger.warn({ orderId, paymentId }, "Payment record not found for webhook order");
      return;
    }

    // Claim atomically
    await paymentsService.confirmPaymentAtomically({
      paymentId: payment.id,
      providerPaymentId: paymentId,
      method: paymentEntity.method || "card",
      rawStatus: paymentEntity.status || "captured",
      actorId: undefined, // System webhook
    });
  }

  private async handlePaymentAuthorized(event: any) {
    const paymentEntity = event.payload?.payment?.entity;
    const paymentId = paymentEntity?.id;
    const amount = paymentEntity?.amount;
    const currency = paymentEntity?.currency || "INR";

    if (!paymentId || !amount) return;

    // Capture payment if not captured
    if (!paymentEntity.captured) {
      const provider = getPaymentProvider();
      await provider.capturePayment(paymentId, amount, currency);
    }
  }

  private async handlePaymentFailed(event: any) {
    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    const failureReason = paymentEntity?.error_description || paymentEntity?.error_reason || "Payment declined";

    if (!orderId) return;

    const payment = await prisma.payment.findUnique({
      where: { providerOrderId: orderId },
    });

    // Never downgrade an already succeeded payment
    if (payment && payment.status !== "SUCCEEDED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          providerPaymentId: paymentId,
          failureReason,
          rawStatus: paymentEntity.status || "failed",
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "payment.failed",
          entity: "Payment",
          entityId: payment.id,
          metadata: {
            reason: failureReason,
            providerPaymentId: paymentId,
          },
        },
      });

      logger.info({ paymentId: payment.id, failureReason }, "Payment marked FAILED from webhook");
    }
  }

  private async handleRefundProcessed(event: any) {
    const refundEntity = event.payload?.refund?.entity;
    const paymentId = refundEntity?.payment_id;
    const refundId = refundEntity?.id;
    const amountPaise = Number(refundEntity?.amount);

    if (!paymentId || !refundId) return;

    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentId },
      include: { refunds: true },
    });

    if (!payment) {
      logger.warn({ paymentId, refundId }, "Payment not found for refund.processed webhook");
      return;
    }

    // Update existing refund row or create if issued directly in Razorpay dashboard
    await prisma.refund.upsert({
      where: { providerRefundId: refundId },
      update: {
        status: "PROCESSED",
      },
      create: {
        paymentId: payment.id,
        amount: amountPaise,
        status: "PROCESSED",
        providerRefundId: refundId,
        reason: refundEntity?.notes?.reason || "Refund processed via gateway",
      },
    });

    // Determine if full or partial refund
    const totalRefunded = payment.refunds.reduce((acc, r) => acc + r.amount, 0) + amountPaise;
    const newStatus = totalRefunded >= payment.amount ? "REFUNDED" : "PARTIALLY_REFUNDED";

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    await prisma.auditLog.create({
      data: {
        action: "refund.processed",
        entity: "Payment",
        entityId: payment.id,
        metadata: {
          refundId,
          amountPaise,
          newStatus,
        },
      },
    });

    logger.info({ paymentId: payment.id, refundId, newStatus }, "Refund confirmed via webhook");
  }
}

export const paymentsWebhookHandler = new PaymentsWebhookHandler();
