import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const disputeResponseSchema = z.object({
  decision: z.enum(["ACCEPT", "DECLINE"]),
  explanation: z.string().min(5, "An explanation is required"),
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

    const { id: disputeId } = await params;
    const body = await request.json();
    const { decision, explanation } = disputeResponseSchema.parse(body);

    const dispute = await prisma.attendanceDispute.findFirst({
      where: {
        id: disputeId,
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
        attendance: true,
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found or unauthorized" }, { status: 404 });
    }

    // Transactional resolve + AuditLog
    await prisma.$transaction(async (tx) => {
      // 1. If accepted, update attendance status to ATTENDED
      if (decision === "ACCEPT") {
        await tx.attendance.update({
          where: { id: dispute.attendanceId },
          data: {
            status: "ATTENDED",
            overrideNote: `Dispute accepted by instructor: ${explanation}`,
            markedBy: "INSTRUCTOR",
            markedByUserId: auth.userId,
          },
        });
      }

      // 2. Update dispute status
      await tx.attendanceDispute.update({
        where: { id: disputeId },
        data: {
          status: decision === "ACCEPT" ? "RESOLVED" : "DECLINED",
          response: explanation,
          resolvedById: auth.userId,
          resolvedAt: new Date(),
        },
      });

      // 3. Notify student
      await tx.notification.create({
        data: {
          userId: dispute.studentId,
          type: "ANNOUNCEMENT",
          channel: "IN_APP",
          title: `Attendance Dispute ${decision === "ACCEPT" ? "Resolved" : "Declined"}`,
          body: `Your attendance dispute was reviewed by your instructor. Result: ${decision}. Note: ${explanation}`,
        },
      });

      // 4. Audit Log (Rule 5)
      await tx.auditLog.create({
        data: {
          actorId: auth.userId,
          action: "INSTRUCTOR_RESOLVE_DISPUTE",
          entity: "AttendanceDispute",
          entityId: disputeId,
          metadata: {
            decision,
            explanation,
            studentId: dispute.studentId,
            attendanceId: dispute.attendanceId,
          },
        },
      });
    });

    return NextResponse.json({ success: true, message: `Dispute marked as ${decision}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error in dispute response:", error);
    return NextResponse.json({ error: "Failed to process dispute" }, { status: 500 });
  }
}
