import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/rbac/roles";

export async function POST(request: Request) {
  try {
    const { email, id } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Lookup user in Prisma database
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseId: id }, { email: email }],
      },
    });

    // If it's the official admin email and role isn't ADMIN, auto-promote it
    if (email.toLowerCase() === "admin@zenflow.yoga") {
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            supabaseId: id,
            email: email,
            name: "Platform Administrator",
            role: ROLES.ADMIN,
          },
        });
      } else if (dbUser.role !== ROLES.ADMIN) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: ROLES.ADMIN, supabaseId: id },
        });
      }
    }

    const isAdmin = dbUser?.role === ROLES.ADMIN;

    return NextResponse.json({
      isAdmin,
      role: dbUser?.role || ROLES.STUDENT,
    });
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

