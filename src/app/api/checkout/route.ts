import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { CreateCheckoutSchema } from "@/modules/payments/payments.schema";
import { paymentsService } from "@/modules/payments/payments.service";

export const POST = createApiHandler(async (request: Request) => {
  // 1. Authenticate student
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to subscribe to a yoga plan.");
  }

  // 2. Rate limiting (10 checkouts per minute per user)
  checkRateLimit(`checkout:${auth.dbUser.id}`, 10, 60_000);

  // 3. Validate request payload
  const body = await request.json();
  const input = CreateCheckoutSchema.parse(body);

  // 4. Generate checkout order
  const checkoutData = await paymentsService.createCheckout({
    userId: auth.dbUser.id,
    planId: input.planId,
    promoCode: input.promoCode,
    billingInterval: input.billingInterval,
  });

  return NextResponse.json({
    success: true,
    ...checkoutData,
  });
});
