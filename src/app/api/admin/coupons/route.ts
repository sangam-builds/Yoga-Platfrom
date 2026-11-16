import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";

export const GET = createApiHandler(async () => {
  await requireAdmin();

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          redemptions: true,
        },
      },
      plans: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json({
    coupons: coupons.map((c) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxRedemptions: c.maxRedemptions,
      perUserLimit: c.perUserLimit,
      redemptionsCount: c._count.redemptions,
      validFrom: c.validFrom.toISOString(),
      validTo: c.validTo?.toISOString() || null,
      isActive: c.isActive,
      applicablePlans: c.plans.map((p) => p.name),
    })),
  });
});
