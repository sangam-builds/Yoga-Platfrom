import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status"); // upcoming | past | cancelled | waitlisted
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  const now = new Date();

  // If status is upcoming, find bookings where session.startsAt >= now and booking status is BOOKED
  const whereClause: any = {
    userId: auth.dbUser.id,
  };

  if (statusParam === "upcoming") {
    whereClause.status = "BOOKED";
    whereClause.session = {
      endsAt: { gte: now },
    };
  } else if (statusParam === "past") {
    whereClause.OR = [
      { status: "COMPLETED" },
      { status: "BOOKED", session: { endsAt: { lt: now } } },
    ];
  } else if (statusParam === "cancelled") {
    whereClause.status = "CANCELLED";
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      session: {
        include: {
          class: {
            include: {
              instructor: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
    orderBy: {
      session: {
        startsAt: statusParam === "upcoming" ? "asc" : "desc",
      },
    },
    take: limit,
  });

  // Map to clean format
  const formatted = bookings.map((b) => ({
    id: b.id,
    bookingNumber: `BK-${b.id.slice(-6).toUpperCase()}`,
    status: b.status,
    sessionId: b.sessionId,
    classTitle: b.session.class.title,
    style: b.session.class.style,
    level: b.session.class.level,
    durationMin: b.session.class.durationMin,
    startsAt: b.session.startsAt.toISOString(),
    endsAt: b.session.endsAt.toISOString(),
    videoRoomUrl: b.session.videoRoomUrl || `/dashboard/live/${b.sessionId}`,
    instructor: {
      name: b.session.class.instructor.user.name,
      avatarUrl: b.session.class.instructor.user.image,
      rating: Number(b.session.class.instructor.ratingAvg),
    },
    thumbnailUrl: b.session.class.thumbnailUrl,
    creditDeducted: b.creditUsed ? 1 : 0,
  }));

  // Also query waitlist if tab is waitlisted or general
  let waitlist: any[] = [];
  if (!statusParam || statusParam === "waitlisted") {
    const entries = await prisma.waitlistEntry.findMany({
      where: { userId: auth.dbUser.id },
      include: {
        session: {
          include: {
            class: {
              include: {
                instructor: { include: { user: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    waitlist = entries.map((w) => ({
      id: w.id,
      sessionId: w.sessionId,
      position: w.position,
      classTitle: w.session.class.title,
      style: w.session.class.style,
      level: w.session.class.level,
      startsAt: w.session.startsAt.toISOString(),
      endsAt: w.session.endsAt.toISOString(),
      instructor: {
        name: w.session.class.instructor.user.name,
      },
    }));
  }

  return NextResponse.json({
    bookings: formatted,
    waitlist,
    totalUpcoming: bookings.length,
  });
}
