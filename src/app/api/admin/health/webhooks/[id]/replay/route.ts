import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { BadRequestError, NotFoundError } from "@/lib/errors";
import { paymentsWebhookHandler } from "@/modules/payments/payments.webhook";
import { computeWebhookSignature } from "@/modules/payments/providers/razorpay.signature";
import { env } from "@/lib/env";

export const POST = createApiHandler(
  async (request: Request, context?: { params?: Promise<{ id: string }> }) => {
    const { dbUser } = await requireAdmin();

    const params = context?.params ? await context.params : null;
    const webhookId = params?.id;
    if (!webhookId) {
      throw new BadRequestError("Webhook ID parameter is required");
    }

    const eventRecord = await prisma.webhookEvent.findUnique({
      where: { id: webhookId },
    });

    if (!eventRecord) {
      throw new NotFoundError("Webhook event not found");
    }

    const rawBody = JSON.stringify(eventRecord.payload);
    const validSignature = computeWebhookSignature(rawBody, env.RAZORPAY_WEBHOOK_SECRET);

    // Reset processedAt so handler will re-process
    await prisma.webhookEvent.update({
      where: { id: eventRecord.id },
      data: { processedAt: null, error: null },
    });

    const result = await paymentsWebhookHandler.handleWebhook(
      rawBody,
      validSignature,
      eventRecord.eventId
    );

    await prisma.auditLog.create({
      data: {
        actorId: dbUser.id,
        action: "webhook.replay",
        entity: "WebhookEvent",
        entityId: eventRecord.id,
        metadata: {
          eventId: eventRecord.eventId,
          eventType: eventRecord.type,
          replayResult: result as any,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook replayed successfully",
      result,
    });
  }
);
