import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().min(5, "A clear cancellation reason is mandatory"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: sessionId } = await params;
    const body = await request.json();
    const { reason } = cancelSchema.parse(body);

    // Verify session ownership
    const session = await prisma.classSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { class: { instructorId: auth.instructorId } },
          { substituteInstructorId: auth.instructorId },
        ],
      },
      include: {
        class: { select: { title: true } },
        bookings: {
          where: { status: "BOOKED" },
          select: { id: true, userId: true, creditUsed: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or not owned by you" }, { status: 404 });
    }

    if (session.status === "CANCELLED") {
      return NextResponse.json({ error: "Session is already cancelled" }, { status: 400 });
    }

    // Execute transactional cancellation, credit refund, waitlist clearing, and audit logging
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark session as CANCELLED
      const updatedSession = await tx.classSession.update({
        where: { id: sessionId },
        data: {
          status: "CANCELLED",
          cancelledReason: reason,
        },
      });

      // 2. Refund credits and notify booked students
      for (const booking of session.bookings) {
        // Mark booking cancelled
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" },
        });

        // If credit was used, refund to student
        if (booking.creditUsed) {
          const sub = await tx.subscription.findFirst({
            where: { userId: booking.userId },
            orderBy: { createdAt: "desc" },
          });

          const currentCredits = sub?.creditsRemaining ?? 5;
          const newBalance = currentCredits + 1;

          if (sub) {
            await tx.subscription.update({
              where: { id: sub.id },
              data: { creditsRemaining: newBalance },
            });
          }

          await tx.creditLedger.create({
            data: {
              userId: booking.userId,
              delta: 1,
              balanceAfter: newBalance,
              reason: "CANCELLATION_REFUND",
              note: `Class session '${session.class.title}' was cancelled by teacher: ${reason}`,
            },
          });
        }

        // Notify student
        await tx.notification.create({
          data: {
            userId: booking.userId,
            sessionId: session.id,
            type: "CLASS_CANCELLED",
            channel: "IN_APP",
            title: `Session Cancelled: ${session.class.title}`,
            body: `Your upcoming class session was cancelled by the instructor. Reason: ${reason}. Any credits used have been refunded.`,
          },
        });
      }

      // 3. Clear waitlist
      await tx.waitlistEntry.deleteMany({
        where: { sessionId: session.id },
      });

      // 4. Write AuditLog in the same transaction (Rule 5)
      await tx.auditLog.create({
        data: {
          actorId: auth.userId,
          action: "INSTRUCTOR_CANCEL_SESSION",
          entity: "ClassSession",
          entityId: session.id,
          metadata: {
            instructorId: auth.instructorId,
            classTitle: session.class.title,
            affectedBookingsCount: session.bookings.length,
            reason,
          },
        },
      });

      return updatedSession;
    });

    return NextResponse.json({
      success: true,
      message: `Session cancelled. ${session.bookings.length} students refunded and notified.`,
      session: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error cancelling session:", error);
    return NextResponse.json({ error: "Failed to cancel session" }, { status: 500 });
  }
}
