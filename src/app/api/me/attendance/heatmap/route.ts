import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weeks = parseInt(searchParams.get("weeks") || "12");
  const userId = auth.dbUser.id;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const attendances = await prisma.attendance.findMany({
    where: {
      userId,
      status: "ATTENDED",
      createdAt: { gte: startDate },
    },
    include: {
      session: {
        include: { class: true },
      },
    },
  });

  // Aggregate by YYYY-MM-DD
  const dayMap: Record<string, { count: number; minutes: number; classes: string[] }> = {};

  for (const a of attendances) {
    const dayStr = a.createdAt.toISOString().split("T")[0];
    if (!dayMap[dayStr]) {
      dayMap[dayStr] = { count: 0, minutes: 0, classes: [] };
    }
    dayMap[dayStr].count += 1;
    dayMap[dayStr].minutes += a.minutesAttended || a.session.class.durationMin;
    dayMap[dayStr].classes.push(a.session.class.title);
  }

  return NextResponse.json({
    weeks,
    days: dayMap,
    totalClassesInPeriod: attendances.length,
  });
}

