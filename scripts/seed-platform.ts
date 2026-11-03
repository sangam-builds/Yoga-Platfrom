import {
  PrismaClient,
  ClassStyle,
  ClassLevel,
  SessionStatus,
  PlanType,
  BillingInterval,
  MilestoneType,
} from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌿 Seeding ZenFlow Yoga Platform data according to specification...");

  // 1. Instructors (User + InstructorProfile)
  const instructorsData = [
    {
      name: "Priya Sharma",
      email: "priya.sharma@zenflow.yoga",
      bio: "Certified Ashtanga and Vinyasa instructor with over 12 years of Himalayan tradition practice.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      ratingAvg: 4.9,
      ratingCount: 142,
      specialties: [ClassStyle.VINYASA, ClassStyle.ASHTANGA],
    },
    {
      name: "Aarav Patel",
      email: "aarav.patel@zenflow.yoga",
      bio: "Breathwork therapist and Hatha specialist focusing on alignment, spinal recovery, and pranayama.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      ratingAvg: 4.8,
      ratingCount: 98,
      specialties: [ClassStyle.HATHA, ClassStyle.BREATHWORK],
    },
    {
      name: "Meera Nair",
      email: "meera.nair@zenflow.yoga",
      bio: "Mindfulness and Yin yoga teacher dedicated to restorative healing, deep relaxation, and sound meditation.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      ratingAvg: 5.0,
      ratingCount: 210,
      specialties: [ClassStyle.YIN, ClassStyle.MEDITATION],
    },
  ];

  const instructors = [];
  for (const inst of instructorsData) {
    const user = await prisma.user.upsert({
      where: { email: inst.email },
      update: { name: inst.name, role: "INSTRUCTOR", image: inst.image },
      create: {
        email: inst.email,
        name: inst.name,
        role: "INSTRUCTOR",
        image: inst.image,
      },
    });

    const profile = await prisma.instructorProfile.upsert({
      where: { userId: user.id },
      update: {
        bio: inst.bio,
        ratingAvg: inst.ratingAvg,
        ratingCount: inst.ratingCount,
        specialties: inst.specialties,
      },
      create: {
        userId: user.id,
        bio: inst.bio,
        ratingAvg: inst.ratingAvg,
        ratingCount: inst.ratingCount,
        specialties: inst.specialties,
      },
    });
    instructors.push({ ...profile, user });
  }
  console.log(`✅ ${instructors.length} Instructors ready`);

  // 2. Plans (Section 6.3)
  const plansData = [
    {
      name: "7-Day Free Trial",
      slug: "free-trial",
      type: PlanType.TRIAL,
      priceInr: 0,
      interval: BillingInterval.NONE,
      credits: 5,
      trialDays: 7,
      features: ["5 Live Classes", "Community Access", "Standard Video Quality"],
    },
    {
      name: "Monthly Flow",
      slug: "monthly-flow",
      type: PlanType.SUBSCRIPTION,
      priceInr: 149900, // ₹1,499.00
      interval: BillingInterval.MONTH,
      credits: null, // unlimited
      trialDays: 0,
      features: [
        "Unlimited Live Yoga Classes",
        "7-Day Replay Window",
        "AI Wellness Assistant",
        "HD Interactive Classroom",
      ],
    },
    {
      name: "Annual Harmony",
      slug: "annual-harmony",
      type: PlanType.SUBSCRIPTION,
      priceInr: 1299900, // ₹12,999.00 (Save 28%)
      interval: BillingInterval.YEAR,
      credits: null, // unlimited
      trialDays: 0,
      features: [
        "Unlimited Live Yoga Classes",
        "Permanent Recording Library",
        "AI Wellness Assistant",
        "Milestone Certificates",
        "Monthly Guest Pass",
      ],
    },
    {
      name: "10-Class Pack",
      slug: "10-class-pack",
      type: PlanType.CLASS_PACK,
      priceInr: 199900, // ₹1,999.00
      interval: BillingInterval.NONE,
      credits: 10,
      trialDays: 0,
      validityDays: 180,
      features: ["10 Credits valid for 6 months", "Book any live session", "No recurring fees"],
    },
  ];

  for (const p of plansData) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        type: p.type,
        priceInr: p.priceInr,
        interval: p.interval,
        credits: p.credits,
        trialDays: p.trialDays,
        features: p.features,
      },
      create: {
        name: p.name,
        slug: p.slug,
        type: p.type,
        priceInr: p.priceInr,
        interval: p.interval,
        credits: p.credits,
        trialDays: p.trialDays,
        features: p.features,
      },
    });
  }
  console.log(`✅ Membership Plans configured`);

  // 3. Yoga Classes & Live Sessions (Sections 3 & 4)
  const classesData = [
    {
      title: "Morning Sun Vinyasa",
      slug: "morning-sun-vinyasa",
      description: "Invigorating sunrise sequence designed to awaken joints, cultivate prana, and build core stability.",
      style: ClassStyle.VINYASA,
      level: ClassLevel.ALL_LEVELS,
      durationMin: 45,
      capacity: 30,
      instructorId: instructors[0].id,
      thumbnailUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
      benefits: ["Enhances core stamina", "Wakes up circulatory system", "Sharpens daily mental focus"],
      propsNeeded: ["Yoga mat", "Yoga block"],
    },
    {
      title: "Hatha Spine & Alignment",
      slug: "hatha-spine-alignment",
      description: "Gentle yet grounding postures held with deep conscious breathing for posture correction and stress relief.",
      style: ClassStyle.HATHA,
      level: ClassLevel.BEGINNER,
      durationMin: 60,
      capacity: 25,
      instructorId: instructors[1].id,
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      benefits: ["Relieves lower back compression", "Improves posture", "Teaches foundational alignment"],
      propsNeeded: ["Yoga mat", "Yoga strap", "Cushion"],
    },
    {
      title: "Yin for Deep Rest & Sleep",
      slug: "yin-deep-rest-sleep",
      description: "Passive floor postures supported by props, releasing deep fascia connective tissues and calming the nervous system.",
      style: ClassStyle.YIN,
      level: ClassLevel.ALL_LEVELS,
      durationMin: 60,
      capacity: 35,
      instructorId: instructors[2].id,
      thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
      benefits: ["Calms central nervous system", "Unwinds tight hips and lower back", "Promotes deep restorative sleep"],
      propsNeeded: ["Yoga mat", "Bolster or pillow", "Warm blanket"],
    },
    {
      title: "Power Flow: Strength & Inversions",
      slug: "power-flow-strength-inversions",
      description: "Dynamic athletic flow incorporating arm balances, handstand prep, and cardiovascular stamina.",
      style: ClassStyle.POWER,
      level: ClassLevel.ADVANCED,
      durationMin: 60,
      capacity: 20,
      instructorId: instructors[0].id,
      thumbnailUrl: "https://images.unsplash.com/photo-1552196563-552443422b8a?auto=format&fit=crop&w=800&q=80",
      benefits: ["Builds upper body and core power", "Overcomes fear in inversions", "High caloric burn"],
      propsNeeded: ["Yoga mat", "Wall space", "2 Blocks"],
    },
    {
      title: "Pranayama & Sound Meditation",
      slug: "pranayama-sound-meditation",
      description: "Sacred breath control techniques paired with singing bowls to soothe anxiety and expand mental clarity.",
      style: ClassStyle.MEDITATION,
      level: ClassLevel.ALL_LEVELS,
      durationMin: 30,
      capacity: 50,
      instructorId: instructors[2].id,
      thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
      benefits: ["Regulates autonomic nervous system", "Deep sensory relaxation", "Dissolves mental fatigue"],
      propsNeeded: ["Comfortable seating", "Headphones recommended"],
    },
  ];

  for (const c of classesData) {
    const yogaClass = await prisma.yogaClass.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        description: c.description,
        style: c.style,
        level: c.level,
        durationMin: c.durationMin,
        capacity: c.capacity,
        instructorId: c.instructorId,
        thumbnailUrl: c.thumbnailUrl,
        benefits: c.benefits,
        propsNeeded: c.propsNeeded,
      },
      create: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        style: c.style,
        level: c.level,
        durationMin: c.durationMin,
        capacity: c.capacity,
        instructorId: c.instructorId,
        thumbnailUrl: c.thumbnailUrl,
        benefits: c.benefits,
        propsNeeded: c.propsNeeded,
      },
    });

    const now = new Date();
    const times = [
      new Date(now.getTime() + 15 * 60 * 1000), // in 15 mins
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 30, 0),
    ];

    for (let s = 0; s < times.length; s++) {
      const startsAt = times[s];
      const endsAt = new Date(startsAt.getTime() + c.durationMin * 60 * 1000);

      await prisma.classSession.upsert({
        where: {
          classId_startsAt: {
            classId: yogaClass.id,
            startsAt: startsAt,
          },
        },
        update: {
          endsAt,
          capacity: c.capacity,
          bookedCount: s === 0 ? 12 : 5,
          status: SessionStatus.SCHEDULED,
        },
        create: {
          classId: yogaClass.id,
          startsAt,
          endsAt,
          capacity: c.capacity,
          bookedCount: s === 0 ? 12 : 5,
          status: SessionStatus.SCHEDULED,
          videoRoomName: `zenflow-room-${c.slug}-${s + 1}`,
          videoRoomUrl: `/dashboard/live/room-${c.slug}-${s + 1}`,
        },
      });
    }
  }
  console.log(`✅ Yoga Classes and Live Sessions scheduled`);

  // 4. Pose Library (Section 12)
  const posesData = [
    {
      englishName: "Downward-Facing Dog",
      sanskritName: "Adho Mukha Svanasana",
      slug: "adho-mukha-svanasana",
      difficulty: ClassLevel.BEGINNER,
      description: "An invigorating inversion that elongates the spine, opens the hamstrings, and brings fresh oxygen to the head.",
      benefits: ["Stretches calves and hamstrings", "Strengthens shoulders, wrists, and core", "Relieves mild anxiety"],
      contraindications: ["Carpal tunnel syndrome", "Late-term pregnancy", "Severe hypertension"],
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
    },
    {
      englishName: "Warrior II",
      sanskritName: "Virabhadrasana II",
      slug: "virabhadrasana-ii",
      difficulty: ClassLevel.BEGINNER,
      description: "A foundational standing stance named after the mythical warrior Virabhadra, fostering inner power, focus, and hip mobility.",
      benefits: ["Strengthens quadriceps and ankles", "Opens hips, chest, and shoulders", "Improves grounded stability"],
      contraindications: ["Recent knee or hip injury", "High blood pressure (keep hands on hips)"],
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
    },
    {
      englishName: "Tree Pose",
      sanskritName: "Vrikshasana",
      slug: "vrikshasana",
      difficulty: ClassLevel.ALL_LEVELS,
      description: "A graceful single-leg balance pose that teaches rooting into the earth while reaching upward like a tall tree.",
      benefits: ["Refines balance and neuromuscular coordination", "Strengthens ankles, calves, and spine", "Aids concentration"],
      contraindications: ["Vertigo or balance disorders", "Severe knee injury (keep foot on lower calf, not knee)"],
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80",
    },
    {
      englishName: "Crow Pose",
      sanskritName: "Bakasana",
      slug: "bakasana",
      difficulty: ClassLevel.ADVANCED,
      description: "An exhilarating arm balance that balances the body on the triceps, unlocking courage and deep abdominal contraction.",
      benefits: ["Builds wrist, arm, and shoulder strength", "Tones transverse abdominals", "Develops supreme focus"],
      contraindications: ["Carpal tunnel syndrome", "Wrist tendinitis", "Pregnancy"],
      imageUrl: "https://images.unsplash.com/photo-1552196563-552443422b8a?auto=format&fit=crop&w=600&q=80",
    },
  ];

  for (const p of posesData) {
    await prisma.pose.upsert({
      where: { slug: p.slug },
      update: {
        englishName: p.englishName,
        sanskritName: p.sanskritName,
        difficulty: p.difficulty,
        description: p.description,
        benefits: p.benefits,
        contraindications: p.contraindications,
        imageUrl: p.imageUrl,
      },
      create: {
        slug: p.slug,
        englishName: p.englishName,
        sanskritName: p.sanskritName,
        difficulty: p.difficulty,
        description: p.description,
        benefits: p.benefits,
        contraindications: p.contraindications,
        imageUrl: p.imageUrl,
      },
    });
  }
  console.log(`✅ Poses library seeded`);

  // 5. Badges (Section 8)
  const badgesData = [
    {
      key: "first_class",
      name: "First Breath",
      description: "Completed your first live yoga session on ZenFlow",
      iconUrl: "sparkles",
      criteria: { classes: 1 },
    },
    {
      key: "7_day_streak",
      name: "7-Day Warrior",
      description: "Maintained a 7-day uninterrupted yoga streak",
      iconUrl: "flame",
      criteria: { streakDays: 7 },
    },
    {
      key: "century_yogi",
      name: "Century Yogi",
      description: "Completed 100 lifetime yoga sessions",
      iconUrl: "award",
      criteria: { classes: 100 },
    },
  ];

  for (const b of badgesData) {
    await prisma.badge.upsert({
      where: { key: b.key },
      update: {
        name: b.name,
        description: b.description,
        iconUrl: b.iconUrl,
        criteria: b.criteria,
      },
      create: {
        key: b.key,
        name: b.name,
        description: b.description,
        iconUrl: b.iconUrl,
        criteria: b.criteria,
      },
    });
  }
  console.log(`✅ Badges configured`);

  // 6. Milestones (Section 9)
  const milestonesData = [
    { key: "classes_10", name: "10-Class Foundation", type: MilestoneType.CLASS_COUNT, threshold: 10 },
    { key: "classes_30", name: "30-Class Mindfulness Master", type: MilestoneType.CLASS_COUNT, threshold: 30 },
    { key: "classes_100", name: "Century Yogi Diploma", type: MilestoneType.CLASS_COUNT, threshold: 100 },
  ];

  for (const m of milestonesData) {
    await prisma.milestone.upsert({
      where: { key: m.key },
      update: { name: m.name, type: m.type, threshold: m.threshold },
      create: { key: m.key, name: m.name, type: m.type, threshold: m.threshold },
    });
  }
  console.log(`✅ Milestones configured`);

  console.log("\n🎉 Platform database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
