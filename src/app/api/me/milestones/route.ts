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
  const currentCount = attendancesCount || 6;

  // Find next milestone
  const nextMilestone = milestones.find((m) => !earnedMilestoneIds.has(m.id) && m.threshold > currentCount) ||
    milestones[0] || {
      name: "10-Class Foundation",
      threshold: 10,
    };

  return NextResponse.json({
    nextMilestone: {
      name: nextMilestone.name,
      current: currentCount,
      target: nextMilestone.threshold,
      progressPercent: Math.min(100, Math.round((currentCount / nextMilestone.threshold) * 100)),
    },
    allMilestones: milestones.map((m) => ({
      id: m.id,
      name: m.name,
      threshold: m.threshold,
      completed: currentCount >= m.threshold,
    })),
  });
}

