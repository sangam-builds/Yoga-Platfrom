import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { paymentsWebhookHandler } from "@/modules/payments/payments.webhook";

export async function POST(request: Request) {
  const startTime = Date.now();
  const signature = request.headers.get("x-razorpay-signature");
  const eventIdHeader = request.headers.get("x-razorpay-event-id");

  if (!signature) {
    logger.warn("Webhook rejected: missing x-razorpay-signature header");
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch (err) {
    logger.error({ err }, "Failed to read raw webhook body");
    return NextResponse.json({ error: "Could not read body" }, { status: 400 });
  }

  try {
    const result = await paymentsWebhookHandler.handleWebhook(rawBody, signature, eventIdHeader);
    const durationMs = Date.now() - startTime;
    logger.info({ result, durationMs }, "Webhook handled successfully");

    return NextResponse.json({
      received: true,
      status: result.status,
      eventId: result.eventId,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    logger.error({ err, durationMs }, "Webhook processing error");

    if (err.statusCode === 400 || err.name === "BadRequestError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Return 500 for server / DB errors so Razorpay retries delivery
    return NextResponse.json(
      { error: "Webhook processing encountered an error" },
      { status: 500 }
    );
  }
}
