import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await params;
  const userId = auth.dbUser.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Session
      const session = await tx.classSession.findUnique({
        where: { id: sessionId },
        include: {
          class: true,
          bookings: {
            where: { userId, status: "BOOKED" },
          },
        },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      if (session.bookings.length > 0) {
        throw new Error("You have already booked this session");
      }

      // Check if session has already ended
      if (new Date(session.endsAt) < new Date()) {
        throw new Error("This class has already ended");
      }

      // 2. Check capacity
      if (session.bookedCount >= session.capacity) {
        // Create waitlist entry instead
        const waitlistCount = await tx.waitlistEntry.count({
          where: { sessionId },
        });
        const waitlistEntry = await tx.waitlistEntry.create({
          data: {
            sessionId,
            userId,
            position: waitlistCount + 1,
          },
        });
        return { waitlisted: true, position: waitlistEntry.position };
      }

      // 3. Check membership & credits
      const subscription = await tx.subscription.findFirst({
        where: {
          userId,
          status: { in: ["ACTIVE", "TRIALING"] },
        },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      });

      let creditUsed = 0;
      if (subscription && subscription.creditsRemaining !== null) {
        if (subscription.creditsRemaining <= 0) {
          throw new Error("Insufficient class credits remaining");
        }
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { creditsRemaining: subscription.creditsRemaining - 1 },
        });
        creditUsed = 1;

        // Record in ledger
        await tx.creditLedger.create({
          data: {
            userId,
            subscriptionId: subscription.id,
            reason: "BOOKING",
            delta: -1,
            balanceAfter: subscription.creditsRemaining - 1,
            note: `Booked ${session.class.title}`,
          },
        });
      }

      // 4. Create Booking
      const booking = await tx.booking.create({
        data: {
          sessionId,
          userId,
          subscriptionId: subscription?.id,
          status: "BOOKED",
          creditUsed: creditUsed > 0,
        },
      });

      // 5. Increment session bookedCount
      await tx.classSession.update({
        where: { id: sessionId },
        data: { bookedCount: { increment: 1 } },
      });

      // 6. Create in-app notification
      await tx.notification.create({
        data: {
          userId,
          sessionId,
          type: "BOOKING_CONFIRMED",
          channel: "IN_APP",
          title: `Booking Confirmed: ${session.class.title}`,
          body: `You are booked for ${new Date(session.startsAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}. Join link will activate 10 minutes prior.`,
          payload: { actionUrl: "/dashboard/bookings" },
          status: "QUEUED",
        },
      });

      const bookingNumber = `BK-${booking.id.slice(-6).toUpperCase()}`;

      return {
        bookingId: booking.id,
        bookingNumber,
        waitlisted: false,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("Booking transaction error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to book class" },
      { status: 400 }
    );
  }
}
