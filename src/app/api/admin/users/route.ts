import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const role = searchParams.get("role");

    const whereClause: any = {};
    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }
    if (role && role !== "ALL") {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        subscriptions: {
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = users.map((u) => {
      const activeSub = u.subscriptions[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        timezone: u.timezone,
        experienceLevel: u.experienceLevel || "Not Set",
        planName: activeSub?.plan?.name || "Free Trial",
        creditsRemaining: activeSub?.creditsRemaining ?? 5,
        status: activeSub?.status || "ACTIVE",
        createdAt: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ users: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
