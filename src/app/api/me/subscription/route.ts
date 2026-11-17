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

    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const fallbackPlan = {
      id: defaultPlan?.id || "plan_trial_default",
      slug: defaultPlan?.slug || "free-trial",
      name: defaultPlan?.name || "7-Day Free Trial",
      type: defaultPlan?.type || "TRIAL",
      priceInr: defaultPlan?.priceInr || 0,
      interval: "NONE",
      credits: 5,
      recordingAccessDays: defaultPlan?.recordingAccessDays || 7,
      features: defaultPlan?.features || ["5 Live Classes", "Community Access", "Standard Video Quality"],
    };

    return NextResponse.json({
      user: {
        id: auth.dbUser.id,
        email: auth.dbUser.email,
        name: auth.dbUser.name,
      },
      subscription: {
        id: "trial_sub",
        status: "TRIALING",
        plan: fallbackPlan,
        creditsRemaining: 5,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: trialEnd.toISOString(),
      },
      plan: fallbackPlan,
      status: "TRIALING",
      renewalDate: trialEnd.toISOString(),
      creditsRemaining: 5,
      totalCredits: 5,
      isPaused: false,
      trialEndsInDays: 7,
      failedPayment: false,
      cancelAtPeriodEnd: false,
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

  const planPayload = {
    id: subscription.plan.id,
    slug: subscription.plan.slug,
    name: subscription.plan.name,
    type: subscription.plan.type,
    priceInr: subscription.plan.priceInr,
    interval: subscription.plan.interval,
    credits: subscription.plan.credits,
    recordingAccessDays: subscription.plan.recordingAccessDays,
    features: subscription.plan.features,
  };

  return NextResponse.json({
    user: {
      id: auth.dbUser.id,
      email: auth.dbUser.email,
      name: auth.dbUser.name,
    },
    subscription: {
      id: subscription.id,
      status: subscription.status,
      plan: planPayload,
      creditsRemaining: subscription.creditsRemaining,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
    },
    subscriptionId: subscription.id,
    plan: planPayload,
    status: subscription.status,
    renewalDate: renewalDate.toISOString(),
    creditsRemaining: subscription.creditsRemaining, // null for unlimited
    totalCredits: subscription.plan.credits, // null for unlimited
    isPaused: subscription.status === "PAUSED",
    trialEndsInDays,
    failedPayment: subscription.failedPaymentCount > 0,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  });
}
