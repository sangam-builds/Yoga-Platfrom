import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { VerifyPaymentSchema } from "@/modules/payments/payments.schema";
import { paymentsService } from "@/modules/payments/payments.service";

export const POST = createApiHandler(async (request: Request) => {
  // 1. Authenticate student
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Please sign in to verify your payment.");
  }

  // 2. Rate limit verification calls
  checkRateLimit(`verify:${auth.dbUser.id}`, 20, 60_000);

  // 3. Validate signature inputs
  const body = await request.json();
  const input = VerifyPaymentSchema.parse(body);

  // 4. Verify signature and confirm payment
  const result = await paymentsService.verifyPayment({
    userId: auth.dbUser.id,
    orderId: input.razorpay_order_id,
    paymentId: input.razorpay_payment_id,
    signature: input.razorpay_signature,
  });

  return NextResponse.json(result);
});
