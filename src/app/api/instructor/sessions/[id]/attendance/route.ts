import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const overrideSchema = z.object({
  attendanceId: z.string(),
  newStatus: z.enum(["ATTENDED", "LATE", "MISSED", "EXCUSED"]),
  overrideNote: z.string().min(4, "A justification note is required for attendance override"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: sessionId } = await params;

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
        class: { select: { title: true, style: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or not owned by you" }, { status: 404 });
    }

    // Bookings and Attendance (Data minimization: Rule 4)
    // Only student name, photo, level, injury flag, attendance status. NEVER email, phone, or payment data!
    const bookings = await prisma.booking.findMany({
      where: { sessionId, status: { in: ["BOOKED", "COMPLETED"] } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            experienceLevel: true,
            injuries: true, // Only for teacher awareness
          },
        },
        attendance: true,
      },
    });

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.class.title,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        status: session.status,
      },
      roster: bookings.map((b) => ({
        bookingId: b.id,
        studentId: b.user.id,
        name: b.user.name,
        avatar: b.user.image,
        experienceLevel: b.user.experienceLevel || "BEGINNER",
        injuries: b.user.injuries || null,
        attendanceId: b.attendance?.id || null,
        attendanceStatus: b.attendance?.status || "SCHEDULED",
        minutesAttended: b.attendance?.minutesAttended || 0,
        markedBy: b.attendance?.markedBy || "AUTO",
        overrideNote: b.attendance?.overrideNote || null,
      })),
    });
  } catch (error) {
    console.error("Error in GET session attendance:", error);
    return NextResponse.json({ error: "Failed to load session roster" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { attendanceId, newStatus, overrideNote } = overrideSchema.parse(body);

    // Verify session ownership
    const session = await prisma.classSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { class: { instructorId: auth.instructorId } },
          { substituteInstructorId: auth.instructorId },
        ],
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found or not owned by you" }, { status: 404 });
    }

    // Transactional override + audit log (Rule 5)
    const updated = await prisma.$transaction(async (tx) => {
      const att = await tx.attendance.update({
        where: { id: attendanceId },
        data: {
          status: newStatus as any,
          markedBy: "INSTRUCTOR",
          markedByUserId: auth.userId,
          overrideNote,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: auth.userId,
          action: "INSTRUCTOR_ATTENDANCE_OVERRIDE",
          entity: "Attendance",
          entityId: attendanceId,
          metadata: {
            instructorId: auth.instructorId,
            sessionId,
            newStatus,
            overrideNote,
          },
        },
      });

      return att;
    });

    return NextResponse.json({ success: true, attendance: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error in PATCH attendance override:", error);
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
