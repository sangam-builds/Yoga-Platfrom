import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClassLevel } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const difficulty = searchParams.get("difficulty");

  const whereClause: any = {};
  if (q) {
    whereClause.OR = [
      { englishName: { contains: q, mode: "insensitive" } },
      { sanskritName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (difficulty) {
    whereClause.difficulty = difficulty as ClassLevel;
  }

  const poses = await prisma.pose.findMany({
    where: whereClause,
    orderBy: { englishName: "asc" },
  });

  return NextResponse.json({ poses });
}
