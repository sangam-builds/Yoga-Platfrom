import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.dbUser.id;

  const [earnedBadges, allBadges, attendancesCount] = await Promise.all([
    prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.badge.findMany({}),
    prisma.attendance.count({ where: { userId, status: "ATTENDED" } }),
  ]);

  const earnedKeys = new Set(earnedBadges.map((eb) => eb.badge.key));
  const lockedBadges = allBadges
    .filter((b) => !earnedKeys.has(b.key))
    .map((b) => {
      const criteria: any = b.criteria;
      const target = criteria?.classes || criteria?.streakDays || 10;
      const current = Math.min(target, attendancesCount || 2);
      const progress = Math.round((current / target) * 100);
      return {
        id: b.id,
        key: b.key,
        name: b.name,
        description: b.description,
        iconUrl: b.iconUrl,
        progress,
        current,
        target,
      };
    });

  return NextResponse.json({
    earned: earnedBadges.map((eb) => ({
      id: eb.badge.id,
      key: eb.badge.key,
      name: eb.badge.name,
      description: eb.badge.description,
      iconUrl: eb.badge.iconUrl,
      earnedAt: eb.earnedAt.toISOString(),
    })),
    nextBadge: lockedBadges[0] || null,
    locked: lockedBadges,
  });
}

