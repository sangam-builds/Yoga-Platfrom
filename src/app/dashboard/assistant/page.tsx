"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  Calendar,
  User,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  suggestedClasses?: string[];
}

export default function AssistantPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      sender: "assistant",
      text: "Namaste! I am your ZenFlow AI Wellness Assistant. I can build tailored yoga sequences, suggest live sessions based on your body's stiffness or goals, and offer biomechanical posture guidance.",
    },
  ]);

  const suggestedPrompts = [
    "Build me a 4-week routine",
    "Help with lower back stiffness",
    "Which plan fits me best?",
    "Morning pranayama for focus",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.reply,
        suggestedClasses: data.suggestedClasses,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      toast.error("Assistant Error", "Could not connect to AI advisor. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <PageHeader
        title="AI Wellness & Sequence Assistant"
        description="Receive intelligent, personalized practice guidance adapting to your goals, physical constraints, and daily prana energy."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "AI Assistant" }]}
      />

      {/* ─── Medical Disclaimer Callout ─────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Medical Disclaimer:</strong> ZenFlow AI provides wellness guidance, not medical diagnosis or prescription. Always consult a physician or licensed therapist for acute injuries.
        </p>
      </div>

      {/* ─── Chat Window ────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === "user"
                    ? "bg-[#233D32] text-white"
                    : "bg-[#6B8F71] text-white shadow-xs"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-[#233D32] text-white rounded-tr-none"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-700/50"
                }`}
              >
                {m.text}

                {/* Suggested Class Routine Buttons */}
                {m.suggestedClasses && m.suggestedClasses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                    {m.suggestedClasses.map((cls, i) => (
                      <Link
                        key={i}
                        href="/dashboard/schedule"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#233D32] text-white text-xs font-bold hover:bg-[#6B8F71] transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book {cls}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-400 italic">
              <span className="w-2 h-2 rounded-full bg-[#6B8F71] animate-ping" />
              <span>Analyzing anatomical alignment & routines...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts Strip */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center gap-2 overflow-x-auto">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#6B8F71] text-gray-700 dark:text-gray-300 shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about yoga routines, alignments, or breathing..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-2xl px-5 py-2.5 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
