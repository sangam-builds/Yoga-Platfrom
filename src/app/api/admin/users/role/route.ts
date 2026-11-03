import { NextResponse } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { UserRole, ROLES } from "@/lib/rbac/roles";

export async function POST(request: Request) {
  try {
    // Enforce ADMIN role on the server
    const { dbUser: adminUser } = await requireAdmin();

    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "targetUserId and newRole are required." },
        { status: 400 }
      );
    }

    if (!Object.values(ROLES).includes(newRole as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role: ${newRole}. Must be ADMIN, INSTRUCTOR, or STUDENT.` },
        { status: 400 }
      );
    }

    // Fetch existing user to ensure they exist
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const previousRole = target.role;

    // Update role in Prisma
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    // Record immutable audit log
    await logAuditEvent({
      actorId: adminUser.id,
      action: "user.role_update",
      entity: "User",
      entityId: targetUserId,
      metadata: {
        targetEmail: target.email,
        previousRole,
        newRole,
        performedBy: adminUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role", details: String(error) },
      { status: 500 }
    );
  }
}

