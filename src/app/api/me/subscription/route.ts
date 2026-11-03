import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: auth.dbUser.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    // Default fallback to 7-Day Free Trial
    const defaultPlan = await prisma.plan.findUnique({
      where: { slug: "free-trial" },
    });

    return NextResponse.json({
      plan: {
        name: defaultPlan?.name || "Free Trial",
        type: defaultPlan?.type || "TRIAL",
        priceInr: defaultPlan?.priceInr || 0,
        interval: "NONE",
      },
      status: "TRIALING",
      renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      creditsRemaining: 5,
      totalCredits: 5,
      isPaused: false,
      trialEndsInDays: 5,
      failedPayment: false,
    });
  }

  const renewalDate = subscription.currentPeriodEnd;
  const isTrial = subscription.status === "TRIALING";
  const trialEndsInDays = subscription.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;

  return NextResponse.json({
    subscriptionId: subscription.id,
    plan: {
      name: subscription.plan.name,
      type: subscription.plan.type,
      priceInr: subscription.plan.priceInr,
      interval: subscription.plan.interval,
    },
    status: subscription.status,
    renewalDate: renewalDate.toISOString(),
    creditsRemaining: subscription.creditsRemaining ?? 24,
    totalCredits: subscription.plan.credits ?? 30,
    isPaused: subscription.status === "PAUSED",
    trialEndsInDays,
    failedPayment: subscription.failedPaymentCount > 0,
  });
}
