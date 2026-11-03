import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId: auth.dbUser.id },
    include: {
      session: {
        include: { class: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { moodBefore, moodAfter, energyBefore, energyAfter, note, sessionId } = body;

    const entry = await prisma.journalEntry.create({
      data: {
        userId: auth.dbUser.id,
        sessionId: sessionId || null,
        moodBefore: moodBefore ? parseInt(moodBefore) : null,
        moodAfter: moodAfter ? parseInt(moodAfter) : null,
        energyBefore: energyBefore ? parseInt(energyBefore) : null,
        energyAfter: energyAfter ? parseInt(energyAfter) : null,
        note: note?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save journal entry" }, { status: 400 });
  }
}
