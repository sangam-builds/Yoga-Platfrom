import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await request.json();
  const lowerMsg = (message || "").toLowerCase();
  const userName = auth.dbUser.name.split(" ")[0];

  let reply = "";
  let suggestedClasses: string[] = [];

  if (lowerMsg.includes("lower back") || lowerMsg.includes("back pain") || lowerMsg.includes("spine")) {
    reply = `Namaste ${userName}. For lower back support, gentle decompression and mindful pelvic tilts work best.\n\n` +
      `⚠️ Medical Disclaimer: If you are experiencing acute pain or disc herniation, please consult a physiotherapist before attempting deep twists.\n\n` +
      `Recommended Practice:\n` +
      `• Adho Mukha Svanasana (Downward-Facing Dog with bent knees)\n` +
      `• Balasana (Child's Pose)\n` +
      `• Marjaryasana-Bitilasana (Cat-Cow Pose, 10 rounds)\n\n` +
      `I recommend joining our "Hatha Spine & Alignment" session tomorrow at 7:00 AM!`;
    suggestedClasses = ["Hatha Spine & Alignment"];
  } else if (lowerMsg.includes("routine") || lowerMsg.includes("4-week") || lowerMsg.includes("schedule")) {
    reply = `Here is a balanced 4-Week Holistic Yoga Program customized for you, ${userName}:\n\n` +
      `• Monday & Wednesday (7:00 AM): Morning Sun Vinyasa (Active Energy & Prana)\n` +
      `• Tuesday & Thursday (6:30 PM): Hatha Spine & Alignment (Structural Health)\n` +
      `• Friday Evening: Yin for Deep Rest & Sleep (Connective Tissue Recovery)\n` +
      `• Sunday Morning: Pranayama & Sound Meditation (Mental Clarity)\n\n` +
      `Would you like me to book your spots for this week's morning flow?`;
    suggestedClasses = ["Morning Sun Vinyasa", "Yin for Deep Rest & Sleep"];
  } else if (lowerMsg.includes("plan") || lowerMsg.includes("membership") || lowerMsg.includes("subscription")) {
    reply = `Based on our current schedule and daily live offerings, the "Monthly Flow" (₹1,499/mo) gives you unlimited access to all live classes, recordings, and interactive teacher feedback. If you practice more than twice a week, it offers maximum savings!`;
  } else {
    reply = `Hello ${userName}! As your ZenFlow Wellness Assistant, I can design personalized yoga routines, provide posture modifications, or recommend live classes matching your goals. What would you like to explore today?`;
  }

  return NextResponse.json({
    reply,
    suggestedClasses,
  });
}
