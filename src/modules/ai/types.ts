export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date;
  suggestedClasses?: SuggestedClass[];
}

export interface SuggestedClass {
  id: string;
  title: string;
  instructorName?: string;
  style?: string;
  level?: string;
  durationMin?: number;
}

export interface StudentWellnessContext {
  studentName: string;
  studentEmail: string;
  experienceLevel?: string;
  activePlanName?: string;
  creditsRemaining?: number | null;
  upcomingBookings?: Array<{
    title: string;
    startsAt: string;
    instructorName?: string;
  }>;
  availableClasses?: SuggestedClass[];
}

export interface GenerateReplyInput {
  userMessage: string;
  studentContext: StudentWellnessContext;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface GenerateReplyOutput {
  reply: string;
  suggestedClasses: SuggestedClass[];
  modelUsed: string;
  source: "gemini" | "fallback";
}
