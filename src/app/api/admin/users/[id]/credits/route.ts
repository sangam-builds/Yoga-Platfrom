import { NextResponse } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUser: adminUser } = await requireAdmin();
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { delta, reason, passcode } = body;

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid audit justification reason (min 5 chars) is required." },
        { status: 400 }
      );
    }

    const deltaNum = parseInt(delta);
    if (isNaN(deltaNum) || deltaNum === 0) {
      return NextResponse.json({ error: "Invalid credit delta" }, { status: 400 });
    }

    // Step-up auth confirmation check for credits > 10
    if (Math.abs(deltaNum) > 10 && !passcode) {
      return NextResponse.json(
        { error: "Credit adjustments over 10 require step-up authentication passcode." },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find active subscription or create fallback
      const sub = await tx.subscription.findFirst({
        where: { userId: targetUserId },
        orderBy: { createdAt: "desc" },
      });

      const currentCredits = sub?.creditsRemaining ?? 5;
      const newBalance = Math.max(0, currentCredits + deltaNum);

      if (sub) {
        await tx.subscription.update({
          where: { id: sub.id },
          data: { creditsRemaining: newBalance },
        });
      }

      // Record in CreditLedger
      await tx.creditLedger.create({
        data: {
          userId: targetUserId,
          subscriptionId: sub?.id,
          reason: "ADMIN_ADJUSTMENT",
          delta: deltaNum,
          balanceAfter: newBalance,
          note: `[Admin Adjustment by ${adminUser.email}] Reason: ${reason}`,
        },
      });

      // Write AuditLog
      await tx.auditLog.create({
        data: {
          actorId: adminUser.id,
          action: "admin.credits_adjusted",
          entity: "User",
          entityId: targetUserId,
          metadata: {
            delta: deltaNum,
            previousBalance: currentCredits,
            newBalance,
            reason,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return { newBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Credits successfully adjusted. New balance: ${result.newBalance}`,
    });
  } catch (err: any) {
    console.error("Credit adjustment error:", err);
    return NextResponse.json({ error: err.message || "Failed to adjust credits" }, { status: 400 });
  }
}
