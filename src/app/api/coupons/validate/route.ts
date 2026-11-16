import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { ValidateCouponSchema } from "@/modules/payments/payments.schema";
import { couponsService } from "@/modules/coupons/coupons.service";

export const POST = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to validate promo codes.");
  }

  const body = await request.json();
  const input = ValidateCouponSchema.parse(body);

  const plan = await prisma.plan.findUnique({
    where: { id: input.planId },
  });

  if (!plan) {
    throw new NotFoundError("Plan not found");
  }

  const result = await couponsService.validateCoupon({
    code: input.code,
    planId: plan.id,
    userId: auth.dbUser.id,
    grossAmountPaise: plan.priceInr,
  });

  return NextResponse.json({
    success: true,
    valid: true,
    ...result,
  });
});
