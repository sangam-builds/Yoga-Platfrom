import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const createClassSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  style: z.enum(["HATHA", "VINYASA", "ASHTANGA", "YIN", "KUNDALINI", "POWER", "RESTORATIVE", "PRANAYAMA", "MEDITATION", "SOUND_HEALING", "YOGA_NIDRA", "CHAIR_YOGA", "PRENATAL", "POSTNATAL", "KIDS", "SENIORS"]),
  level: z.enum(["ALL_LEVELS", "BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationMin: z.number().min(15).max(180).default(60),
  capacity: z.number().min(1).max(500).default(30),
  propsNeeded: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  startTimeLocal: z.string().optional(),
  recurrenceRule: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { instructorId } = auth;
    const { searchParams } = new URL(request.url);
    const style = searchParams.get("style");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      instructorId, // MANDATORY OWNERSHIP
    };

    if (style) where.style = style;
    if (status === "ACTIVE") where.isActive = true;
    if (status === "INACTIVE") where.isActive = false;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const classes = await prisma.yogaClass.findMany({
      where,
      include: {
        _count: { select: { sessions: true } },
        sessions: {
          where: { startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 1,
          select: { id: true, startsAt: true, bookedCount: true, capacity: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      classes: classes.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        style: c.style,
        level: c.level,
        durationMin: c.durationMin,
        capacity: c.capacity,
        isActive: c.isActive,
        recurrenceRule: c.recurrenceRule,
        startTimeLocal: c.startTimeLocal,
        totalSessionsCount: c._count.sessions,
        nextSession: c.sessions[0] || null,
        propsNeeded: c.propsNeeded,
        benefits: c.benefits,
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/instructor/classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const validated = createClassSchema.parse(body);

    const slug = `${validated.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;

    const newClass = await prisma.yogaClass.create({
      data: {
        title: validated.title,
        slug,
        description: validated.description,
        style: validated.style as any,
        level: validated.level as any,
        durationMin: validated.durationMin,
        capacity: validated.capacity,
        propsNeeded: validated.propsNeeded,
        benefits: validated.benefits,
        startTimeLocal: validated.startTimeLocal,
        recurrenceRule: validated.recurrenceRule,
        instructorId: auth.instructorId, // MANDATORY OWNERSHIP
        timezone: auth.profile.timezone || "Asia/Kolkata",
      },
    });

    return NextResponse.json({ success: true, class: newClass }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error in POST /api/instructor/classes:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
