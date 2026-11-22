import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiConfig } from "../ai.config";
import {
  GenerateReplyInput,
  GenerateReplyOutput,
  SuggestedClass,
} from "../types";
import { buildWellnessSystemPrompt } from "../prompts/wellness-system.prompt";

export class GeminiProvider {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI | null {
    if (!aiConfig.isConfigured()) {
      return null;
    }
    if (!this.client) {
      this.client = new GoogleGenerativeAI(aiConfig.apiKey);
    }
    return this.client;
  }

  /**
   * Generates a personalized wellness response using Google Gemini.
   */
  async generateReply(input: GenerateReplyInput): Promise<GenerateReplyOutput> {
    const { userMessage, studentContext, conversationHistory } = input;
    const client = this.getClient();

    // If Gemini API Key is not yet configured, return an intelligent guided response
    if (!client) {
      return this.generateFallbackResponse(input);
    }

    try {
      const systemInstruction = buildWellnessSystemPrompt(studentContext);

      const model = client.getGenerativeModel({
        model: aiConfig.model,
        systemInstruction: {
          role: "system",
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: aiConfig.temperature,
          topP: aiConfig.topP,
          topK: aiConfig.topK,
          maxOutputTokens: aiConfig.maxOutputTokens,
        },
      });

      // Format previous history for Gemini multi-turn chat
      // Gemini expects role: "user" | "model"
      const history = conversationHistory
        .slice(-10) // Keep recent 10 turns for context efficiency
        .map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userMessage);
      const reply = result.response.text();

      const suggestedClasses = this.extractSuggestedClasses(
        reply,
        studentContext.availableClasses || []
      );

      return {
        reply,
        suggestedClasses,
        modelUsed: aiConfig.model,
        source: "gemini",
      };
    } catch (err: unknown) {
      console.error("[GeminiProvider] Error generating response:", err);
      // Fallback gracefully so student experience is never broken
      return this.generateFallbackResponse(input, err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Matches recommended class titles in Gemini's response with actual ZenFlow studio classes.
   */
  private extractSuggestedClasses(
    text: string,
    availableClasses: SuggestedClass[]
  ): SuggestedClass[] {
    if (!availableClasses || availableClasses.length === 0) return [];

    const lower = text.toLowerCase();
    const matched: SuggestedClass[] = [];

    for (const cls of availableClasses) {
      if (lower.includes(cls.title.toLowerCase())) {
        matched.push(cls);
      }
    }

    return matched.slice(0, 3);
  }

  /**
   * Generates a context-aware yogic response if Gemini API key is missing or encounters a network issue.
   */
  private generateFallbackResponse(
    input: GenerateReplyInput,
    errorMessage?: string
  ): GenerateReplyOutput {
    const { userMessage, studentContext } = input;
    const firstName = studentContext.studentName.split(" ")[0] || "Practitioner";
    const lower = userMessage.toLowerCase();

    let reply = "";
    const suggested: SuggestedClass[] = [];
    const available = studentContext.availableClasses || [];

    if (lower.includes("back") || lower.includes("spine") || lower.includes("pain") || lower.includes("stiff")) {
      reply = `Namaste ${firstName}. For spinal health and lower back tension, prioritize gentle decompression and breath synchronization.\n\n` +
        `⚠️ **Safety Note**: If experiencing sharp or radiating nerve pain, please consult a physiotherapist before attempting deep forward bends or twists.\n\n` +
        `**Recommended Asanas:**\n` +
        `• **Balasana (Child's Pose)** with knees wide and a bolster under chest.\n` +
        `• **Marjaryasana-Bitilasana (Cat-Cow Pose)** — 10 slow rounds linking breath to spine articulation.\n` +
        `• **Supta Padangusthasana (Reclining Hand-to-Big-Toe)** with a yoga strap around the foot to release tight hamstrings.\n\n` +
        `We have sessions designed for alignment and structural ease. Check out our schedule below to practice with our instructors!`;
    } else if (lower.includes("routine") || lower.includes("program") || lower.includes("plan") || lower.includes("week")) {
      reply = `Here is a balanced weekly flow recommendation tailored for you, ${firstName}:\n\n` +
        `• **Morning (3x/week)**: *Surya Namaskar* (Sun Salutations) to activate solar prana and core warmth.\n` +
        `• **Midweek Evening**: *Hatha Alignment* focusing on hip mobility and shoulder opening.\n` +
        `• **Weekend**: *Yin Yoga & Yoga Nidra* for parasympathetic nervous system restoration.\n\n` +
        `Take a look at the studio schedule to book your preferred time slot!`;
    } else {
      reply = `Namaste ${firstName}! I am your ZenFlow AI Wellness Assistant, powered by Google Gemini.\n\n` +
        `I can help you with:\n` +
        `• Designing customized asana sequences for energy, flexibility, or relaxation\n` +
        `• Anatomical adjustments, prop usage, and safe modifications\n` +
        `• Recommending live classes based on your current skill level and goals\n\n` +
        `How does your body feel today, and what would you like to cultivate on your mat?`;
    }

    // Match any available classes
    if (available.length > 0) {
      suggested.push(...available.slice(0, 2));
    }

    if (!aiConfig.isConfigured()) {
      reply += `\n\n*(Note: To unlock live Google Gemini responses, add \`GEMINI_API_KEY\` to your \`.env.local\` file.)*`;
    } else if (errorMessage) {
      console.warn(`[GeminiProvider] Using fallback due to: ${errorMessage}`);
    }

    return {
      reply,
      suggestedClasses: suggested,
      modelUsed: "zenflow-wellness-engine",
      source: "fallback",
    };
  }
}

export const geminiProvider = new GeminiProvider();
