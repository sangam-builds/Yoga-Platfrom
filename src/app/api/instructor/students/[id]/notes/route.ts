import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getInstructorApiAuth } from "@/lib/rbac/instructor";
import { z } from "zod";

const noteSchema = z.object({
  content: z.string().min(2, "Note content cannot be empty"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: studentId } = await params;

    const notes = await prisma.studentNote.findMany({
      where: {
        studentId,
        instructorId: auth.instructorId, // MANDATORY OWNERSHIP
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error in GET student notes:", error);
    return NextResponse.json({ error: "Failed to fetch student notes" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getInstructorApiAuth();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id: studentId } = await params;
    const body = await request.json();
    const { content } = noteSchema.parse(body);

    const note = await prisma.studentNote.create({
      data: {
        studentId,
        instructorId: auth.instructorId,
        content,
      },
    });

    return NextResponse.json({ success: true, note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Error creating student note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
