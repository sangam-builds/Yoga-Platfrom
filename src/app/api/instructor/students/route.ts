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

    // Fetch attendances for sessions taught by this instructor
    const attendances = await prisma.attendance.findMany({
      where: {
        session: {
          OR: [{ class: { instructorId } }, { substituteInstructorId: instructorId }],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            experienceLevel: true,
            // PRIVACY BY DESIGN: NEVER expose email, phone, or payment data!
          },
        },
        session: { select: { startsAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregate by student
    const studentMap = new Map<string, any>();
    for (const a of attendances) {
      if (!studentMap.has(a.userId)) {
        studentMap.set(a.userId, {
          id: a.user.id,
          name: a.user.name,
          image: a.user.image,
          level: a.user.experienceLevel || "BEGINNER",
          attendanceCount: 0,
          lastAttendedAt: a.session.startsAt.toISOString(),
        });
      }
      const record = studentMap.get(a.userId);
      if (a.status === "ATTENDED") {
        record.attendanceCount += 1;
      }
    }

    return NextResponse.json({
      students: Array.from(studentMap.values()),
    });
  } catch (error) {
    console.error("Error in GET /api/instructor/students:", error);
    return NextResponse.json({ error: "Failed to fetch student list" }, { status: 500 });
  }
}
