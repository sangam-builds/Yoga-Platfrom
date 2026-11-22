import { prisma } from "@/lib/prisma";
import { MessageRole } from "@prisma/client";

export class AiRepository {
  /**
   * Finds or creates the active assistant conversation for a student.
   */
  async getOrCreateConversation(userId: string) {
    let conversation = await prisma.assistantConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.assistantConversation.create({
        data: {
          userId,
          title: "Wellness & Practice Guidance",
        },
      });
    }

    return conversation;
  }

  /**
   * Retrieves messages for a conversation, ordered chronologically.
   */
  async getConversationMessages(conversationId: string, limit: number = 20) {
    const messages = await prisma.assistantMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.reverse();
  }

  /**
   * Saves a new message to the conversation.
   */
  async saveMessage(
    conversationId: string,
    role: "USER" | "ASSISTANT",
    content: string,
    tokens?: { inputTokens?: number; outputTokens?: number }
  ) {
    const message = await prisma.assistantMessage.create({
      data: {
        conversationId,
        role: role === "USER" ? MessageRole.USER : MessageRole.ASSISTANT,
        content,
        inputTokens: tokens?.inputTokens,
        outputTokens: tokens?.outputTokens,
      },
    });

    // Touch conversation updatedAt
    await prisma.assistantConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  /**
   * Deletes all messages in the student's conversation.
   */
  async clearConversation(userId: string) {
    const conversation = await prisma.assistantConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    if (conversation) {
      await prisma.assistantMessage.deleteMany({
        where: { conversationId: conversation.id },
      });
    }
  }
}

export const aiRepository = new AiRepository();
