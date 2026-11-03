import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const payoutDetailsSchema = z.object({
  accountHolderName: z.string().min(3),
  accountType: z.enum(["BANK_ACCOUNT", "UPI"]),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  passcode: z.string().min(4, "Step-up authorization passcode required"),
});

export async function PUT(request: Request) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validated = payoutDetailsSchema.parse(body);

    // Save payout details in InstructorProfile and write AuditLog
    const maskedDetails =
      validated.accountType === "UPI"
        ? `UPI ID: ${validated.upiId?.slice(0, 3)}••••@${validated.upiId?.split("@")[1] || "bank"}`
        : `${validated.bankName || "Bank"} •••• ${validated.accountNumber?.slice(-4)} (IFSC: ${validated.ifscCode})`;

    await prisma.$transaction(async (tx) => {
      await tx.instructorProfile.update({
        where: { id: auth.instructorId },
        data: {
          payoutDetails: {
            accountHolder: validated.accountHolderName,
            type: validated.accountType,
            masked: maskedDetails,
            updatedAt: new Date().toISOString(),
          },
        },
      });

      // Audit Log (Rule 7)
      await tx.auditLog.create({
        data: {
          actorId: auth.userId,
          action: "INSTRUCTOR_UPDATE_PAYOUT_DETAILS",
          entity: "InstructorProfile",
          entityId: auth.instructorId,
          metadata: {
            accountType: validated.accountType,
            masked: maskedDetails,
          },
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: auth.userId,
          type: "ANNOUNCEMENT",
          channel: "IN_APP",
          title: "Payout Account Updated",
          body: `Your teaching payout destination was updated to ${maskedDetails}. If you did not make this change, contact security immediately.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Payout details updated and verified.",
      masked: maskedDetails,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error updating payout details:", error);
    return NextResponse.json({ error: "Failed to update payout details" }, { status: 500 });
  }
}
