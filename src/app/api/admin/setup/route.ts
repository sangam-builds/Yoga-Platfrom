import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/rbac/roles";

const DEFAULT_ADMIN_EMAIL = "admin@zenflow.yoga";
const DEFAULT_ADMIN_PASSWORD = "AdminZenFlow2026!";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Try to sign up the admin user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      options: {
        data: {
          full_name: "Platform Administrator",
          role: ROLES.ADMIN,
        },
      },
    });

    const supabaseId = signUpData.user?.id;

    // 2. Upsert in Prisma Database
    const user = await prisma.user.upsert({
      where: { email: DEFAULT_ADMIN_EMAIL },
      update: {
        role: ROLES.ADMIN,
        name: "Platform Administrator",
        ...(supabaseId ? { supabaseId } : {}),
      },
      create: {
        email: DEFAULT_ADMIN_EMAIL,
        name: "Platform Administrator",
        role: ROLES.ADMIN,
        supabaseId: supabaseId,
      },
    });

    // 3. Write Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "admin.bootstrap",
          entity: "User",
          entityId: user.id,
          metadata: {
            email: DEFAULT_ADMIN_EMAIL,
            role: ROLES.ADMIN,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch {
      // Non-blocking if table is still pending db:push
    }

    return NextResponse.json({
      success: true,
      message: "Admin account successfully configured with Role: ADMIN.",
      credentials: {
        email: DEFAULT_ADMIN_EMAIL,
        password: DEFAULT_ADMIN_PASSWORD,
        role: ROLES.ADMIN,
      },
      signUpNotice: signUpError ? signUpError.message : "User registered in Supabase",
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup admin account", details: String(error) },
      { status: 500 }
    );
  }
}

