import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES, isConfiguredAdminEmail } from "@/lib/rbac/roles";

export async function POST(request: Request) {
  try {
    const { email, id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const isPreconfigured = isConfiguredAdminEmail(email);

    let dbUser: { id: string; role: string } | null = null;

    try {
      // Lookup user in Prisma database
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ supabaseId: id }, { email: email }],
        },
        select: { id: true, role: true },
      });

      // If preconfigured admin and role is not ADMIN, auto-promote in DB
      if (isPreconfigured) {
        if (!dbUser) {
          const created = await prisma.user.create({
            data: {
              supabaseId: id,
              email: email,
              name: "Platform Administrator",
              role: ROLES.ADMIN,
            },
            select: { id: true, role: true },
          });
          dbUser = created;
        } else if (dbUser.role !== ROLES.ADMIN) {
          const updated = await prisma.user.update({
            where: { id: dbUser.id },
            data: { role: ROLES.ADMIN, supabaseId: id },
            select: { id: true, role: true },
          });
          dbUser = updated;
        }
      }
    } catch (dbErr) {
      console.warn("DB check in /api/admin/verify encountered an issue (using fallback):", dbErr);
    }

    const isAdmin = dbUser?.role === ROLES.ADMIN || isPreconfigured;

    return NextResponse.json({
      isAdmin,
      role: isAdmin ? ROLES.ADMIN : (dbUser?.role || ROLES.STUDENT),
    });
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
