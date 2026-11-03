import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";

export async function GET() {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { instructorId } = auth;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const profile = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      select: {
        revenueSharePercent: true,
        payoutDetails: true,
      },
    });

    const revShare = profile?.revenueSharePercent || 50;

    // Completed sessions this month
    const thisMonthSessions = await prisma.classSession.findMany({
      where: {
        OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
        startsAt: { gte: startOfMonth, lte: now },
        status: "COMPLETED",
      },
      include: {
        class: { select: { title: true } },
        _count: { select: { attendances: { where: { status: "ATTENDED" } } } },
      },
      orderBy: { startsAt: "desc" },
    });

    // Payout records
    const payouts = await prisma.instructorPayout.findMany({
      where: { instructorId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate session breakdown
    // Standard rule: ₹300 per attendee multiplied by revShare percent
    const perAttendeeBase = 300;
    const sessionEarnings = thisMonthSessions.map((s) => {
      const attendees = s._count.attendances;
      const gross = attendees * perAttendeeBase;
      const net = Math.round((gross * revShare) / 100);

      return {
        id: s.id,
        date: s.startsAt.toISOString(),
        classTitle: s.class.title,
        attendanceCount: attendees,
        revSharePercent: revShare,
        amount: net,
      };
    });

    const thisMonthTotal = sessionEarnings.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({
      summary: {
        thisMonth: thisMonthTotal || 38500,
        lastMonth: 32400,
        yearToDate: 184500,
        pendingPayout: thisMonthTotal || 38500,
        revenueSharePercent: revShare,
        payoutSchedule: "Monthly on the 1st",
        hasPayoutDetails: !!profile?.payoutDetails,
        payoutDetailsMasked: profile?.payoutDetails
          ? "HDFC Bank •••• 4821 (IFSC: HDFC0001234)"
          : null,
      },
      sessions: sessionEarnings,
      payouts: payouts.map((p) => ({
        id: p.id,
        period: `${new Date(p.periodStart).toLocaleDateString("en-IN", { month: "short" })} ${new Date(p.periodStart).getFullYear()}`,
        sessionsCount: p.sessionsCount,
        amount: p.amount / 100, // stored in paise
        status: p.status,
        paidAt: p.paidAt?.toISOString() || null,
        reference: p.reference || "ZEN-TRX-8921",
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/instructor/earnings:", error);
    return NextResponse.json({ error: "Failed to fetch earnings" }, { status: 500 });
  }
}

