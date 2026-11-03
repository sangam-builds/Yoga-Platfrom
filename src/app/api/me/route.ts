import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dbUser, authUser } = auth;
  const activeSub = dbUser.subscriptions[0];

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.image || authUser.user_metadata?.avatar_url || null,
      role: dbUser.role,
      timezone: dbUser.timezone,
      locale: dbUser.locale,
      experienceLevel: dbUser.experienceLevel,
      goals: dbUser.goals,
      preferredStyles: dbUser.preferredStyles,
      hasActivePlan: !!activeSub,
      planName: activeSub?.plan?.name || "No Active Plan",
      creditsRemaining: activeSub?.creditsRemaining ?? 5,
      emailVerified: !!dbUser.emailVerified || !!authUser.email_confirmed_at,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, timezone, locale, experienceLevel, goals, preferredStyles } = body;

    const updated = await prisma.user.update({
      where: { id: auth.dbUser.id },
      data: {
        ...(name ? { name } : {}),
        ...(timezone ? { timezone } : {}),
        ...(locale ? { locale } : {}),
        ...(experienceLevel ? { experienceLevel } : {}),
        ...(goals ? { goals } : {}),
        ...(preferredStyles ? { preferredStyles } : {}),
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("PATCH /api/me error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
