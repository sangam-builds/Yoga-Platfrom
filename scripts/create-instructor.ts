import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const INSTRUCTOR_EMAIL = process.argv[2] || "instructor@zenflow.yoga";
const INSTRUCTOR_PASSWORD = process.argv[3] || "InstructorZenFlow2026!";
const INSTRUCTOR_NAME = process.argv[4] || "Aarav Mehta";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log(`\n==================================================`);
  console.log(`🌿 ZenFlow — Demo Instructor Provisioning Tool`);
  console.log(`==================================================\n`);
  console.log(`Target Email:    ${INSTRUCTOR_EMAIL}`);
  console.log(`Target Password: ${INSTRUCTOR_PASSWORD}`);
  console.log(`Target Name:     ${INSTRUCTOR_NAME}\n`);

  let supabaseUserId: string | null = null;

  // 1. Provision user in Supabase Auth
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signUp({
        email: INSTRUCTOR_EMAIL,
        password: INSTRUCTOR_PASSWORD,
        options: {
          data: {
            full_name: INSTRUCTOR_NAME,
            role: "INSTRUCTOR",
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
       SET email_confirmed_at = NOW(),
           last_sign_in_at = COALESCE(last_sign_in_at, NOW()),
           raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"], "role": "INSTRUCTOR"}'::jsonb,
           raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name": "${INSTRUCTOR_NAME}", "role": "INSTRUCTOR"}'::jsonb
       WHERE LOWER(email) = LOWER($1)`,
      INSTRUCTOR_EMAIL
    );
    console.log(`✅ Account email confirmed & activated in auth.users.`);

    // If we didn't get supabaseUserId from signUp, query auth.users
    if (!supabaseUserId) {
      const authUser: any = await prisma.$queryRawUnsafe(
        `SELECT id FROM auth.users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        INSTRUCTOR_EMAIL
      );
      if (authUser && authUser[0]?.id) {
        supabaseUserId = authUser[0].id;
        console.log(`🔗 Found existing Supabase ID: ${supabaseUserId}`);
      }
    }
  } catch (confErr) {
    console.warn("Notice updating auth.users:", confErr);
  }

  // 2. Upsert user in Prisma
  const user = await prisma.user.upsert({
    where: { email: INSTRUCTOR_EMAIL },
    update: {
      role: "INSTRUCTOR",
      name: INSTRUCTOR_NAME,
      emailVerified: new Date(),
      ...(supabaseUserId ? { supabaseId: supabaseUserId } : {}),
    },
    create: {
      email: INSTRUCTOR_EMAIL,
      name: INSTRUCTOR_NAME,
      role: "INSTRUCTOR",
      supabaseId: supabaseUserId,
      emailVerified: new Date(),
    },
  });

  console.log(`✅ PostgreSQL User record ready: ${user.id}`);

  // 3. Upsert InstructorProfile
  const profile = await prisma.instructorProfile.upsert({
    where: { userId: user.id },
    update: {
      approvalStatus: "APPROVED",
      isActive: true,
      bio: "Dedicated Vinyasa and Hatha yoga master with 10+ years of practice in Rishikesh and Mysore. Focused on somatic awareness, breathwork, and alignment.",
      specialties: ["VINYASA", "HATHA", "MEDITATION", "BREATHWORK"],
      certifications: ["RYT-500", "Yoga Alliance International", "Pranayama Specialist"],
      yearsExperience: 10,
      ratingAvg: 4.95,
      ratingCount: 42,
      revenueSharePercent: 50,
      timezone: "Asia/Kolkata",
      payoutDetails: {
        accountHolder: INSTRUCTOR_NAME,
        type: "BANK_ACCOUNT",
        masked: "HDFC Bank •••• 4821 (IFSC: HDFC0001234)",
        updatedAt: new Date().toISOString(),
      },
    },
    create: {
      userId: user.id,
      approvalStatus: "APPROVED",
      isActive: true,
      bio: "Dedicated Vinyasa and Hatha yoga master with 10+ years of practice in Rishikesh and Mysore. Focused on somatic awareness, breathwork, and alignment.",
      specialties: ["VINYASA", "HATHA", "MEDITATION", "BREATHWORK"],
      certifications: ["RYT-500", "Yoga Alliance International", "Pranayama Specialist"],
      yearsExperience: 10,
      ratingAvg: 4.95,
      ratingCount: 42,
      revenueSharePercent: 50,
      timezone: "Asia/Kolkata",
      payoutDetails: {
        accountHolder: INSTRUCTOR_NAME,
        type: "BANK_ACCOUNT",
        masked: "HDFC Bank •••• 4821 (IFSC: HDFC0001234)",
        updatedAt: new Date().toISOString(),
      },
    },
  });

  console.log(`✅ Instructor Profile activated: ${profile.id}`);

  // 4. Seed Demo Classes if none exist for this instructor
  const classCount = await prisma.yogaClass.count({
    where: { instructorId: profile.id },
  });

  if (classCount === 0) {
    const class1 = await prisma.yogaClass.create({
      data: {
        title: "Morning Awakening Vinyasa",
        slug: `morning-awakening-vinyasa-${Date.now().toString().slice(-4)}`,
        description: "Dynamic breath-synchronized flow awakening physical vitality and core strength.",
        style: "VINYASA",
        level: "ALL_LEVELS",
        durationMin: 60,
        capacity: 30,
        instructorId: profile.id,
        propsNeeded: ["Yoga Mat", "2 Foam Blocks", "Strap"],
        benefits: ["Core stability", "Spine flexibility", "Cardiovascular rhythm"],
        startTimeLocal: "07:00",
        recurrenceRule: "FREQ=WEEKLY;BYDAY=MO,WE,FR",
      },
    });

    const class2 = await prisma.yogaClass.create({
      data: {
        title: "Hatha Alignment & Pranayama",
        slug: `hatha-alignment-pranayama-${Date.now().toString().slice(-4)}`,
        description: "Foundational postures with emphasis on safe anatomical alignment and breath retention.",
        style: "HATHA",
        level: "BEGINNER",
        durationMin: 75,
        capacity: 25,
        instructorId: profile.id,
        propsNeeded: ["Yoga Mat", "Bolster", "Blanket"],
        benefits: ["Joint health", "Breath control", "Stress reduction"],
        startTimeLocal: "09:00",
        recurrenceRule: "FREQ=WEEKLY;BYDAY=TU,TH",
      },
    });

    console.log(`✅ Demo classes created: '${class1.title}', '${class2.title}'`);

    // Create session for today (starts in 25 mins for live test)
    const now = new Date();
    const sessionStarts = new Date(now.getTime() + 25 * 60 * 1000);
    const sessionEnds = new Date(sessionStarts.getTime() + 60 * 60 * 1000);

    const session = await prisma.classSession.create({
      data: {
        classId: class1.id,
        startsAt: sessionStarts,
        endsAt: sessionEnds,
        capacity: 25,
        bookedCount: 18,
        status: "SCHEDULED",
        videoRoomName: `zenflow-vinyasa-${Date.now().toString(36)}`,
        notes: "Focus on opening thoracic spine and gentle warrior transitions.",
      },
    });

    console.log(`✅ Demo live session scheduled for today: ${session.id}`);
  }

  console.log(`\n==================================================`);
  console.log(`🎉 Instructor Credentials Ready:`);
  console.log(`   URL:      http://localhost:3000/login (or http://localhost:3000/instructor)`);
  console.log(`   Email:    ${INSTRUCTOR_EMAIL}`);
  console.log(`   Password: ${INSTRUCTOR_PASSWORD}`);
  console.log(`   Role:     INSTRUCTOR (Approved & Active)`);
  console.log(`==================================================\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error provisioning instructor:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
