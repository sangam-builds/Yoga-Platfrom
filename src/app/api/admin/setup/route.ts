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

    // 2. Ensure email is marked as confirmed in auth.users and auth.identities
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE auth.users 
         SET email_confirmed_at = NOW(),
             confirmation_token = '',
             recovery_token = '',
             email_change_token_new = '',
             email_change_token_current = '',
             last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
             raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"], "role": "ADMIN"}'::jsonb,
             raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name": "Platform Administrator", "role": "ADMIN", "email_verified": true, "phone_verified": false}'::jsonb
         WHERE LOWER(email) = LOWER($1)`,
        DEFAULT_ADMIN_EMAIL
      );
      await prisma.$executeRawUnsafe(
        `UPDATE auth.identities
         SET identity_data = COALESCE(identity_data, '{}'::jsonb) || '{"email_verified": true}'::jsonb
         WHERE LOWER(email) = LOWER($1)`,
        DEFAULT_ADMIN_EMAIL
      );
    } catch (e) {
      console.warn("Could not auto-confirm in auth.users:", e);
    }

    // 3. Upsert in Prisma Database
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

