import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.dbUser.id;

  const [attendancesCount, milestones, certificates] = await Promise.all([
    prisma.attendance.count({ where: { userId, status: "ATTENDED" } }),
    prisma.milestone.findMany({ orderBy: { threshold: "asc" } }),
    prisma.certificate.findMany({ where: { userId } }),
  ]);

  const earnedMilestoneIds = new Set(certificates.map((c) => c.milestoneId).filter(Boolean));
  const currentCount = attendancesCount;

  // Find next milestone
  const nextMilestone =
    milestones.find((m) => !earnedMilestoneIds.has(m.id) && m.threshold > currentCount) ||
    milestones[0] || {
      name: "10-Class Foundation",
      threshold: 10,
    };

  const target = nextMilestone.threshold || 10;
  const progressPercent = target > 0 ? Math.min(100, Math.round((currentCount / target) * 100)) : 0;

  return NextResponse.json({
    nextMilestone: {
      name: nextMilestone.name,
      current: currentCount,
      target,
      progressPercent,
    },
    allMilestones: milestones.map((m) => ({
      id: m.id,
      name: m.name,
      threshold: m.threshold,
      completed: currentCount >= m.threshold,
    })),
  });
}

