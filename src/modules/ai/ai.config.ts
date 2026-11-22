export const aiConfig = {
  get apiKey(): string {
    return (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ""
    );
  },
  model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1200,

  isConfigured(): boolean {
    const key = this.apiKey;
    return typeof key === "string" && key.trim().length > 0;
  },
};
