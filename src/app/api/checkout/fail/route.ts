import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api-handler";
import { getAuthUser } from "@/lib/auth/get-user";
import { UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FailPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string().optional().nullable(),
  failureReason: z.string().optional().nullable(),
});

export const POST = createApiHandler(async (request: Request) => {
  const auth = await getAuthUser();
  if (!auth?.dbUser) {
    throw new UnauthorizedError("Authentication required.");
  }

  const body = await request.json();
  const { orderId, paymentId, failureReason } = FailPaymentSchema.parse(body);

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId: orderId },
  });

  if (payment && payment.userId === auth.dbUser.id && payment.status === "PENDING") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        providerPaymentId: paymentId || payment.providerPaymentId,
        failureReason: failureReason || "Payment was cancelled or declined.",
        rawStatus: "failed",
      },
    });
  }

  return NextResponse.json({ success: true });
});
