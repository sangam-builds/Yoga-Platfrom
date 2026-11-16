import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";

export const GET = createApiHandler(async () => {
  await requireAdmin();

  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          subscriptions: { where: { status: "ACTIVE" } },
          payments: { where: { status: "SUCCEEDED" } },
        },
      },
    },
  });

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      type: p.type,
      interval: p.interval,
      priceInr: p.priceInr,
      credits: p.credits,
      validityDays: p.validityDays,
      trialDays: p.trialDays,
      recordingAccessDays: p.recordingAccessDays,
      features: p.features,
      isActive: p.isActive,
      activeSubscribers: p._count.subscriptions,
      totalPurchases: p._count.payments,
      createdAt: p.createdAt.toISOString(),
    })),
  });
});
