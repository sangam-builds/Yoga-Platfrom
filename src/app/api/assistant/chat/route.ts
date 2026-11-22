import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { aiService } from "@/modules/ai";

/**
 * GET /api/assistant/chat
 * Retrieves the student's conversation history.
 */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await aiService.getChatHistory(auth.dbUser.id);
    return NextResponse.json({ history });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to fetch history" }, { status });
  }
}

/**
 * POST /api/assistant/chat
 * Sends a message to Google Gemini for the student and returns the personalized response.
 */
export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const result = await aiService.sendMessage(auth.dbUser.id, message.trim());

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to process message" }, { status });
  }
}

/**
 * DELETE /api/assistant/chat
 * Clears the student's conversation history.
 */
export async function DELETE() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await aiService.clearChat(auth.dbUser.id);
    return NextResponse.json({ success: true, message: "Chat history cleared" });
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to clear chat" }, { status });
  }
}
