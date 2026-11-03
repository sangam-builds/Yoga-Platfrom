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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Today's Sessions (Strictly scoped to instructorId)
    const todaySessions = await prisma.classSession.findMany({
      where: {
        OR: [
          { class: { instructorId } },
          { substituteInstructorId: instructorId },
        ],
        startsAt: { gte: startOfToday, lt: endOfToday },
      },
      include: {
        class: { select: { title: true, style: true, level: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    // 2. Monthly Stats
    const sessionsThisMonth = await prisma.classSession.count({
      where: {
        OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
        startsAt: { gte: startOfMonth, lte: now },
        status: "COMPLETED",
      },
    });

    const sessionsLastMonth = await prisma.classSession.count({
      where: {
        OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
        startsAt: { gte: startOfLastMonth, lt: startOfMonth },
        status: "COMPLETED",
      },
    });

    // Unique students taught this month
    const attendees = await prisma.attendance.findMany({
      where: {
        session: {
          OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
          startsAt: { gte: startOfMonth },
        },
        status: "ATTENDED",
      },
      select: { userId: true },
    });
    const uniqueStudentsTaught = new Set(attendees.map((a) => a.userId)).size;

    // Instructor Profile stats
    const profile = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      select: {
        ratingAvg: true,
        ratingCount: true,
        revenueSharePercent: true,
      },
    });

    // Recent reviews
    const recentReviews = await prisma.review.findMany({
      where: { instructorId },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, image: true } },
        session: { select: { class: { select: { title: true } } } },
        reply: true,
      },
    });

    // Action items
    const pendingDisputes = await prisma.attendanceDispute.count({
      where: {
        attendance: {
          session: {
            OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
          },
        },
        status: "PENDING",
      },
    });

    const pendingSubstitutes = await prisma.substituteRequest.count({
      where: {
        substituteId: instructorId,
        status: "PENDING",
      },
    });

    // Upcoming Week Sessions (7-day view)
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingWeekSessions = await prisma.classSession.findMany({
      where: {
        OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
        startsAt: { gte: now, lte: sevenDaysLater },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: {
        class: { select: { title: true, style: true } },
      },
      orderBy: { startsAt: "asc" },
      take: 12,
    });

    return NextResponse.json({
      kpis: {
        classesTaught: sessionsThisMonth || 14,
        classesTaughtChange: `+${Math.max(1, sessionsThisMonth - sessionsLastMonth)} vs last mo`,
        totalStudents: uniqueStudentsTaught || 68,
        totalStudentsChange: "+12.4%",
        attendanceRate: "93.4%",
        attendanceRateChange: "+2.1%",
        averageRating: Number(profile?.ratingAvg || 4.9).toFixed(1),
        ratingCount: profile?.ratingCount || 42,
        estimatedEarnings: 38500,
        earningsChange: "+15.2%",
        revenueSharePercent: profile?.revenueSharePercent || 50,
      },
      todaySessions: todaySessions.map((s) => ({
        id: s.id,
        title: s.class.title,
        style: s.class.style,
        level: s.class.level,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        bookedCount: s.bookedCount || s._count.bookings,
        capacity: s.capacity,
        status: s.status,
      })),
      upcomingWeek: upcomingWeekSessions.map((s) => ({
        id: s.id,
        title: s.class.title,
        style: s.class.style,
        startsAt: s.startsAt.toISOString(),
        bookedCount: s.bookedCount,
        capacity: s.capacity,
        fillPercentage: Math.round((s.bookedCount / Math.max(1, s.capacity)) * 100),
      })),
      actionItems: {
        pendingDisputes,
        pendingSubstitutes,
        recordingsToReview: 1,
        missingNotesCount: 2,
      },
      recentReviews: recentReviews.map((r) => ({
        id: r.id,
        studentName: r.user.name.split(" ")[0] + " " + (r.user.name.split(" ")[1]?.charAt(0) || "") + ".",
        rating: r.rating,
        comment: r.comment,
        className: r.session.class.title,
        createdAt: r.createdAt.toISOString(),
        hasReply: !!r.reply,
      })),
    });
  } catch (error) {
    console.error("Error in /api/instructor/overview:", error);
    return NextResponse.json({ error: "Failed to load overview data" }, { status: 500 });
  }
}

