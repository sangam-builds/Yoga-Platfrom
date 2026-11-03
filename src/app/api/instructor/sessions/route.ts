import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const createSessionSchema = z.object({
  classId: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  capacity: z.number().min(1).max(500),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { instructorId } = auth;
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const status = searchParams.get("status");

    const where: any = {
      OR: [
        { class: { instructorId } },
        { substituteInstructorId: instructorId },
      ],
    };

    if (start && end) {
      where.startsAt = { gte: new Date(start), lte: new Date(end) };
    }
    if (status) {
      where.status = status;
    }

    const sessions = await prisma.classSession.findMany({
      where,
      include: {
        class: {
          select: { id: true, title: true, style: true, level: true, durationMin: true },
        },
        _count: { select: { bookings: true, waitlist: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        classId: s.classId,
        title: s.class.title,
        style: s.class.style,
        level: s.class.level,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        capacity: s.capacity,
        bookedCount: s.bookedCount || s._count.bookings,
        waitlistCount: s._count.waitlist,
        status: s.status,
        videoRoomName: s.videoRoomName,
        notes: s.notes,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/instructor/sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validated = createSessionSchema.parse(body);

    // Verify class ownership
    const yogaClass = await prisma.yogaClass.findFirst({
      where: { id: validated.classId, instructorId: auth.instructorId },
    });

    if (!yogaClass) {
      return NextResponse.json({ error: "Class not found or not owned by you" }, { status: 404 });
    }

    // Business rule 1: "An instructor cannot have two overlapping sessions. The check runs on the server inside a transaction."
    const startDate = new Date(validated.startsAt);
    const endDate = new Date(validated.endsAt);

    const overlapping = await prisma.classSession.findFirst({
      where: {
        OR: [{ class: { instructorId: auth.instructorId } }, { substituteInstructorId: auth.instructorId }],
        status: { not: "CANCELLED" },
        AND: [
          { startsAt: { lt: endDate } },
          { endsAt: { gt: startDate } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Conflict: You already have another session scheduled during this time window." },
        { status: 409 }
      );
    }

    const roomName = `zenflow-session-${Date.now().toString(36)}`;

    const session = await prisma.classSession.create({
      data: {
        classId: validated.classId,
        startsAt: startDate,
        endsAt: endDate,
        capacity: validated.capacity,
        videoRoomName: roomName,
        videoRoomUrl: `/dashboard/live/${roomName}`,
        notes: validated.notes,
      },
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error in POST /api/instructor/sessions:", error);
    return NextResponse.json({ error: "Failed to schedule session" }, { status: 500 });
  }
}
