import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;
  const userId = auth.dbUser.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { session: { include: { class: true } } },
      });

      if (!booking || booking.userId !== userId) {
        throw new Error("Booking not found or unauthorized");
      }

      if (booking.status === "CANCELLED") {
        throw new Error("Booking is already cancelled");
      }

      // Mark cancelled
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      // Decrement bookedCount
      await tx.classSession.update({
        where: { id: booking.sessionId },
        data: { bookedCount: { decrement: 1 } },
      });

      // Credit refund logic (Refund if cancelled >= 2 hours before startsAt)
      const now = Date.now();
      const sessionStart = new Date(booking.session.startsAt).getTime();
      const hoursUntilStart = (sessionStart - now) / (1000 * 60 * 60);

      let refunded = false;
      if (hoursUntilStart >= 2 && booking.creditUsed && booking.subscriptionId) {
        const sub = await tx.subscription.findUnique({
          where: { id: booking.subscriptionId },
        });
        if (sub && sub.creditsRemaining !== null) {
          await tx.subscription.update({
            where: { id: sub.id },
            data: { creditsRemaining: sub.creditsRemaining + 1 },
          });

          await tx.creditLedger.create({
            data: {
              userId,
              subscriptionId: sub.id,
              reason: "CANCELLATION_REFUND",
              delta: 1,
              balanceAfter: sub.creditsRemaining + 1,
              note: `Refund for early cancellation of ${booking.session.class.title}`,
            },
          });
          refunded = true;
        }
      }

      // Promote next waitlisted user if available
      const nextWaitlisted = await tx.waitlistEntry.findFirst({
        where: { sessionId: booking.sessionId },
        orderBy: { position: "asc" },
      });

      if (nextWaitlisted) {
        await tx.waitlistEntry.delete({
          where: { id: nextWaitlisted.id },
        });

        // Notify promoted user
        await tx.notification.create({
          data: {
            userId: nextWaitlisted.userId,
            sessionId: booking.sessionId,
            type: "WAITLIST_PROMOTED",
            channel: "IN_APP",
            title: `Spot opened! ${booking.session.class.title}`,
            body: `A spot opened for your waitlisted class. Tap to complete booking.`,
            payload: { actionUrl: "/dashboard/schedule" },
            status: "QUEUED",
          },
        });
      }

      return {
        success: true,
        refunded,
        message: refunded
          ? "Booking cancelled. 1 class credit was refunded to your balance."
          : "Booking cancelled.",
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Cancel booking error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to cancel booking" },
      { status: 400 }
    );
  }
}
