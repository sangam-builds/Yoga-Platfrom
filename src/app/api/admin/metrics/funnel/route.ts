import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac/server";
import { getOnboardingFunnelMetrics } from "@/modules/onboarding/onboarding.analytics";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const now = new Date();
    let startDate = new Date();
    if (period === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === "all") {
      startDate = new Date(0);
    } else {
      // 30d
      startDate.setDate(now.getDate() - 30);
    }

    const funnel = await getOnboardingFunnelMetrics(startDate);
    return NextResponse.json({
      period,
      funnel,
    });
  } catch (err: any) {
    console.error("GET /api/admin/metrics/funnel error:", err);
    return NextResponse.json(
      { error: "Unauthorized or failed to calculate onboarding funnel" },
      { status: 403 }
    );
  }
}
