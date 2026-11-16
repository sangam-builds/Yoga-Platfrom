import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { paymentsRepository } from "@/modules/payments/payments.repository";

export const GET = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Authentication required.");
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
  const cursor = searchParams.get("cursor") || undefined;

  const payments = await paymentsRepository.listUserPayments(auth.dbUser.id, limit, cursor);

  return NextResponse.json({
    payments: payments.map((p: any) => ({
      id: p.id,
      amount: p.amount,
      taxAmount: p.taxAmount,
      discountAmount: p.discountAmount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      providerOrderId: p.providerOrderId,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      planName: p.plan?.name || "Yoga Membership",
      planInterval: p.plan?.interval || "NONE",
      refunds: p.refunds,
    })),
  });
});
