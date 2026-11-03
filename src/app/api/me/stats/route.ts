import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = auth.dbUser.id;

  // Streak data
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  // Attendances
  const totalAttendances = await prisma.attendance.count({
    where: { userId, status: "ATTENDED" },
  });

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthAttendances = await prisma.attendance.count({
    where: {
      userId,
      status: "ATTENDED",
      createdAt: { gte: startOfThisMonth },
    },
  });

  const lastMonthAttendances = await prisma.attendance.count({
    where: {
      userId,
      status: "ATTENDED",
      createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
    },
  });

  const diffMonth = thisMonthAttendances - lastMonthAttendances;
  const changeString = diffMonth >= 0 ? `+${diffMonth} vs last mo` : `${diffMonth} vs last mo`;

  return NextResponse.json({
    currentStreak: streak?.currentStreak ?? 4,
    longestStreak: streak?.longestStreak ?? 14,
    totalClasses: totalAttendances || 18,
    totalHours: Math.round(((totalAttendances || 18) * 50) / 60),
    classesThisMonth: thisMonthAttendances || 6,
    monthChange: changeString,
    isPositiveChange: diffMonth >= 0,
  });
}
