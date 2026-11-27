import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.dbUser.id;

  // 1. User preferences (e.g. weeklyGoal from onboarding)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      weeklyGoal: true,
      experienceLevel: true,
      goals: true,
      preferredStyles: true,
    },
  });

  // 2. Streak data
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  // 3. Attendances
  const totalAttendances = await prisma.attendance.count({
    where: { userId, status: "ATTENDED" },
  });

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Start of this week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const [thisMonthAttendances, lastMonthAttendances, thisWeekAttendances] = await Promise.all([
    prisma.attendance.count({
      where: {
        userId,
        status: "ATTENDED",
        createdAt: { gte: startOfThisMonth },
      },
    }),
    prisma.attendance.count({
      where: {
        userId,
        status: "ATTENDED",
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    }),
    prisma.attendance.count({
      where: {
        userId,
        status: "ATTENDED",
        createdAt: { gte: startOfWeek },
      },
    }),
  ]);

  const diffMonth = thisMonthAttendances - lastMonthAttendances;
  const changeString =
    lastMonthAttendances > 0
      ? diffMonth >= 0
        ? `+${diffMonth} vs last mo`
        : `${diffMonth} vs last mo`
      : null;

  const weeklyGoalTarget = user?.weeklyGoal || 3;
  const weeklyGoalCompleted = thisWeekAttendances;

  return NextResponse.json({
    currentStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    streakDays: streak?.currentStreak ?? 0,
    totalClasses: totalAttendances,
    totalHours: Math.round(((totalAttendances * 50) / 60) * 10) / 10,
    classesThisMonth: thisMonthAttendances,
    classesDelta: diffMonth,
    monthChange: changeString,
    isPositiveChange: diffMonth >= 0,
    weeklyGoalTarget,
    weeklyGoalCompleted,
  });
}

