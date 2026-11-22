import { prisma } from "@/lib/prisma";
import { BookingStatus, Role } from "@prisma/client";
import { aiRepository } from "./ai.repository";
import { geminiProvider } from "./providers/gemini.provider";
import {
  ChatMessage,
  GenerateReplyOutput,
  StudentWellnessContext,
  SuggestedClass,
} from "./types";

export class AiService {
  /**
   * Enforces that the assistant is only accessible to students.
   * Throws an error or returns unauthorized if user is an instructor or admin.
   */
  private async verifyStudentAccess(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        experienceLevel: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Constraint: AI Assistant is ONLY for the student side, not instructor or admin
    if (user.role === Role.INSTRUCTOR || user.role === Role.ADMIN) {
      const err = new Error(
        "The ZenFlow AI Wellness Assistant is currently available exclusively for student practitioners."
      );
      (err as { statusCode?: number }).statusCode = 403;
      throw err;
    }

    return user;
  }

  /**
   * Gathers rich context about the student, including upcoming bookings and available live classes.
   */
  private async getStudentContext(userId: string): Promise<StudentWellnessContext> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
        },
        bookings: {
          where: {
            session: {
              startsAt: { gte: new Date() },
            },
            status: BookingStatus.BOOKED,
          },
          include: {
            session: {
              include: {
                class: {
                  include: {
                    instructor: {
                      include: {
                        user: { select: { name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
          take: 3,
        },
      },
    });

    if (!user) {
      throw new Error("Student not found");
    }

    const activeSub = user.subscriptions[0];
    const activePlanName = activeSub?.plan?.name || "Pay As You Go";
    const creditsRemaining = activeSub?.creditsRemaining ?? null;

    const upcomingBookings = user.bookings.map((b) => ({
      title: b.session.class.title,
      startsAt: b.session.startsAt.toLocaleDateString("en-IN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      instructorName: b.session.class.instructor?.user?.name || "Instructor",
    }));

    // Fetch active classes from ZenFlow to give Google Gemini ground truth
    const yogaClasses = await prisma.yogaClass.findMany({
      where: { isActive: true },
      take: 6,
      include: {
        instructor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const availableClasses: SuggestedClass[] = yogaClasses.map((c) => ({
      id: c.id,
      title: c.title,
      instructorName: c.instructor?.user?.name || "Certified Teacher",
      style: String(c.style),
      level: String(c.level),
      durationMin: c.durationMin,
    }));

    return {
      studentName: user.name || "Practitioner",
      studentEmail: user.email,
      experienceLevel: user.experienceLevel ? String(user.experienceLevel) : "All Levels",
      activePlanName,
      creditsRemaining,
      upcomingBookings,
      availableClasses,
    };
  }

  /**
   * Processes a student's chat message using Google Gemini with student context.
   */
  async sendMessage(userId: string, userMessage: string): Promise<GenerateReplyOutput> {
    await this.verifyStudentAccess(userId);

    const studentContext = await this.getStudentContext(userId);
    const conversation = await aiRepository.getOrCreateConversation(userId);

    // Fetch recent message history
    const existingMessages = await aiRepository.getConversationMessages(conversation.id, 8);
    const conversationHistory = existingMessages.map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

    // Save user message to database
    await aiRepository.saveMessage(conversation.id, "USER", userMessage);

    // Call Google Gemini Provider
    const replyOutput = await geminiProvider.generateReply({
      userMessage,
      studentContext,
      conversationHistory,
    });

    // Save assistant reply to database
    await aiRepository.saveMessage(conversation.id, "ASSISTANT", replyOutput.reply);

    return replyOutput;
  }

  /**
   * Retrieves conversation history for the student.
   */
  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    await this.verifyStudentAccess(userId);

    const conversation = await aiRepository.getOrCreateConversation(userId);
    const messages = await aiRepository.getConversationMessages(conversation.id, 30);

    return messages.map((m) => ({
      id: m.id,
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
      createdAt: m.createdAt,
    }));
  }

  /**
   * Clears the student's conversation history.
   */
  async clearChat(userId: string): Promise<void> {
    await this.verifyStudentAccess(userId);
    await aiRepository.clearConversation(userId);
  }
}

export const aiService = new AiService();
