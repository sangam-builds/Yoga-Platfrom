import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.argv[2] || "admin@zenflow.yoga";
const ADMIN_PASSWORD = process.argv[3] || "AdminZenFlow2026!";
const ADMIN_NAME = process.argv[4] || "Platform Administrator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log(`\n==================================================`);
  console.log(`🌿 ZenFlow — Admin Provisioning Tool`);
  console.log(`==================================================\n`);
  console.log(`Target Admin Email:    ${ADMIN_EMAIL}`);
  console.log(`Target Admin Password: ${ADMIN_PASSWORD}`);
  console.log(`Target Admin Name:     ${ADMIN_NAME}\n`);

  let supabaseUserId: string | null = null;

  // 1. Provision user in Supabase Auth
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: ADMIN_NAME,
            role: "ADMIN",
          },
        },
      });

      if (error) {
        console.log(`ℹ️ Supabase Auth notice: ${error.message}`);
      } else if (data.user) {
        supabaseUserId = data.user.id;
        console.log(`✅ Supabase Auth account provisioned: ${data.user.id}`);
      }
    } catch (sbErr) {
      console.warn("Could not contact Supabase Auth directly:", sbErr);
    }
  }

  // 1.5 Auto-confirm email in Supabase auth.users
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE auth.users 
       SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
           last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
           raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"], "role": "ADMIN"}'::jsonb,
           raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name": "${ADMIN_NAME}", "role": "ADMIN"}'::jsonb
       WHERE LOWER(email) = LOWER($1)`,
      ADMIN_EMAIL
    );
    console.log(`✅ Account email confirmed & activated in auth.users.`);
  } catch (confErr) {
    console.warn("Notice updating auth.users:", confErr);
  }

  // 2. Provision / Upsert user in PostgreSQL via Prisma
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      name: ADMIN_NAME,
      ...(supabaseUserId ? { supabaseId: supabaseUserId } : {}),
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: "ADMIN",
      supabaseId: supabaseUserId,
    },
  });

  console.log(`✅ PostgreSQL record updated via Prisma:`);
  console.log(`   - ID:          ${user.id}`);
  console.log(`   - Name:        ${user.name}`);
  console.log(`   - Email:       ${user.email}`);
  console.log(`   - Role:        ${user.role} (ADMIN)`);
  if (user.supabaseId) {
    console.log(`   - Supabase ID: ${user.supabaseId}`);
  }

  // 3. Write Audit Log
  try {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "admin.cli_provision",
        entity: "User",
        entityId: user.id,
        metadata: {
          email: ADMIN_EMAIL,
          role: "ADMIN",
          script: "scripts/create-admin.ts",
          timestamp: new Date().toISOString(),
        },
      },
    });
    console.log(`🔒 Security Audit Log entry generated.`);
  } catch {
    // Non-blocking
  }

  console.log(`\n==================================================`);
  console.log(`🔑 Admin Login Ready at:`);
  console.log(`   http://localhost:3000/admin/login`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`==================================================\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error provisioning admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
