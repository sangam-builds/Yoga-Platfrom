import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/modules/payments/providers";

export const GET = createApiHandler(async () => {
  await requireAdmin();

  const provider = getPaymentProvider();
  const providerMode = provider.getMode();

  const now = new Date();
  const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const past30Minutes = new Date(now.getTime() - 30 * 60 * 1000);

  const [
    events,
    failed24hCount,
    lastEvent,
    stuckPendingCount,
  ] = await Promise.all([
    prisma.webhookEvent.findMany({
      where: { provider: "razorpay" },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.webhookEvent.count({
      where: {
        provider: "razorpay",
        error: { not: null },
        createdAt: { gte: past24Hours },
      },
    }),
    prisma.webhookEvent.findFirst({
      where: { provider: "razorpay" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.payment.count({
      where: {
        status: "PENDING",
        createdAt: { lte: past30Minutes },
      },
    }),
  ]);

  let healthStatus: "healthy" | "warning" | "critical" = "healthy";
  if (failed24hCount > 5 || stuckPendingCount > 3) {
    healthStatus = "critical";
  } else if (failed24hCount > 0 || stuckPendingCount > 0) {
    healthStatus = "warning";
  }

  return NextResponse.json({
    gateway: {
      provider: "Razorpay",
      mode: providerMode,
      status: healthStatus,
      lastReceivedAt: lastEvent?.createdAt?.toISOString() || null,
      failedEvents24h: failed24hCount,
      stuckPendingPayments: stuckPendingCount,
    },
    events: events.map((e) => ({
      id: e.id,
      eventId: e.eventId,
      type: e.type,
      processedAt: e.processedAt?.toISOString() || null,
      error: e.error,
      createdAt: e.createdAt.toISOString(),
      payload: e.payload,
    })),
  });
});
