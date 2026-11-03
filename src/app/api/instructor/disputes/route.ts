import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";

export async function GET() {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const disputes = await prisma.attendanceDispute.findMany({
      where: {
        attendance: {
          session: {
            OR: [
              { class: { instructorId: auth.instructorId } },
              { substituteInstructorId: auth.instructorId },
            ],
          },
        },
      },
      include: {
        student: { select: { id: true, name: true, image: true } },
        attendance: {
          include: {
            session: {
              include: { class: { select: { title: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      disputes: disputes.map((d) => ({
        id: d.id,
        attendanceId: d.attendanceId,
        studentName: d.student.name,
        studentAvatar: d.student.image,
        message: d.message,
        status: d.status,
        response: d.response,
        resolvedAt: d.resolvedAt?.toISOString() || null,
        classTitle: d.attendance.session.class.title,
        sessionDate: d.attendance.session.startsAt.toISOString(),
        currentStatus: d.attendance.status,
        minutesAttended: d.attendance.minutesAttended,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/instructor/disputes:", error);
    return NextResponse.json({ error: "Failed to fetch disputes" }, { status: 500 });
  }
}
