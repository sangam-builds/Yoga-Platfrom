import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";
import { ClassStyle, ClassLevel } from "@prisma/client";

export async function GET(request: Request) {
  const auth = await getAuthUser();
  const userId = auth?.dbUser.id;

  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style");
  const level = searchParams.get("level");
  const duration = searchParams.get("duration"); // short (<30) | medium (30-60) | long (>60)
  const openOnly = searchParams.get("openOnly") === "true";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const from = fromParam ? new Date(fromParam) : new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const to = toParam ? new Date(toParam) : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const whereClause: any = {
    startsAt: {
      gte: from,
      lte: to,
    },
    status: { in: ["SCHEDULED", "LIVE"] },
  };

  if (style) {
    whereClause.class = { ...whereClause.class, style: style as ClassStyle };
  }
  if (level) {
    whereClause.class = { ...whereClause.class, level: level as ClassLevel };
  }
  if (duration === "short") {
    whereClause.class = { ...whereClause.class, durationMin: { lt: 30 } };
  } else if (duration === "medium") {
    whereClause.class = { ...whereClause.class, durationMin: { gte: 30, lte: 60 } };
  } else if (duration === "long") {
    whereClause.class = { ...whereClause.class, durationMin: { gt: 60 } };
  }

  const sessions = await prisma.classSession.findMany({
    where: whereClause,
    include: {
      class: {
        include: {
          instructor: {
            include: { user: true },
          },
        },
      },
      bookings: userId
        ? {
            where: { userId, status: "BOOKED" },
            select: { id: true },
          }
        : false,
      waitlist: userId
        ? {
            where: { userId },
            select: { id: true, position: true },
          }
        : false,
    },
    orderBy: { startsAt: "asc" },
  });

  const formatted = sessions
    .map((s) => {
      const spotsRemaining = Math.max(0, s.capacity - s.bookedCount);
      const isFull = spotsRemaining === 0;
      const isFewSpots = !isFull && spotsRemaining <= Math.ceil(s.capacity * 0.2);
      const isBooked = s.bookings && s.bookings.length > 0;
      const isWaitlisted = s.waitlist && s.waitlist.length > 0;

      return {
        id: s.id,
        classId: s.classId,
        title: s.class.title,
        description: s.class.description,
        style: s.class.style,
        level: s.class.level,
        durationMin: s.class.durationMin,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        capacity: s.capacity,
        bookedCount: s.bookedCount,
        spotsRemaining,
        spotsStatus: isFull ? "FULL" : isFewSpots ? "FEW_SPOTS" : "OPEN",
        thumbnailUrl: s.class.thumbnailUrl,
        benefits: s.class.benefits,
        propsNeeded: s.class.propsNeeded,
        instructor: {
          name: s.class.instructor.user.name,
          avatarUrl: s.class.instructor.user.image,
          rating: Number(s.class.instructor.ratingAvg),
          bio: s.class.instructor.bio,
        },
        userState: isBooked ? "BOOKED" : isWaitlisted ? "WAITLISTED" : null,
        bookingId: isBooked ? s.bookings[0].id : null,
      };
    })
    .filter((s) => (openOnly ? s.spotsRemaining > 0 : true));

  return NextResponse.json({ sessions: formatted });
}
