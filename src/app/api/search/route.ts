import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const [classes, instructors, poses] = await Promise.all([
    prisma.yogaClass.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
      include: { instructor: { include: { user: true } } },
    }),
    prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        name: { contains: q, mode: "insensitive" },
      },
      take: 3,
      include: { instructorProfile: true },
    }),
    prisma.pose.findMany({
      where: {
        OR: [
          { englishName: { contains: q, mode: "insensitive" } },
          { sanskritName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 4,
    }),
  ]);

  const results: Array<{
    type: "class" | "instructor" | "pose";
    id: string;
    title: string;
    subtitle: string;
    href: string;
  }> = [];

  for (const c of classes) {
    results.push({
      type: "class",
      id: c.id,
      title: c.title,
      subtitle: `${c.style} • ${c.durationMin} mins • by ${c.instructor.user.name}`,
      href: `/dashboard/schedule?style=${c.style}`,
    });
  }

  for (const inst of instructors) {
    results.push({
      type: "instructor",
      id: inst.id,
      title: inst.name,
      subtitle: `Yoga Instructor • ⭐ ${Number(inst.instructorProfile?.ratingAvg || 5.0).toFixed(1)}`,
      href: `/dashboard/schedule`,
    });
  }

  for (const p of poses) {
    results.push({
      type: "pose",
      id: p.id,
      title: `${p.englishName} (${p.sanskritName || ""})`,
      subtitle: `${p.difficulty} • ${p.benefits.slice(0, 2).join(", ")}`,
      href: `/dashboard/poses#${p.slug}`,
    });
  }

  return NextResponse.json({ results });
}

