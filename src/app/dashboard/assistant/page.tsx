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
      <div className="p-3.5 rounded-2xl bg-[#FAF2E6] dark:bg-[#2C2114] border border-[#EDD8B6] dark:border-[#4D381F] flex items-start gap-2.5 text-xs text-[#8C6228] dark:text-[#ECCB95] font-figtree">
        <AlertTriangle className="w-4 h-4 text-[#8C6228] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold font-outfit uppercase tracking-wider text-[11px]">Medical Disclaimer:</strong> ZenFlow AI provides wellness guidance, not medical diagnosis or prescription. Always consult a physician or licensed therapist for acute injuries.
        </p>
      </div>

      {/* ─── Chat Window ────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] shadow-xs flex flex-col h-[600px] overflow-hidden font-figtree">
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
                    ? "bg-[#47664A] text-white"
                    : "bg-[#E1EDDD] dark:bg-[#223528] text-[#35523E] dark:text-[#A7C7A8] shadow-xs"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === "user"
                    ? "bg-[#47664A] text-white rounded-tr-none"
                    : "bg-[#FAF6EE] dark:bg-[#15231A] text-[#29352F] dark:text-[#E8EFE8] rounded-tl-none border border-[#D1DBCF] dark:border-[#283E31]"
                }`}
              >
                {m.text}

                {/* Suggested Class Routine Buttons */}
                {m.suggestedClasses && m.suggestedClasses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#D1DBCF] dark:border-[#283E31] flex flex-wrap gap-2">
                    {m.suggestedClasses.map((cls, i) => (
                      <Link
                        key={i}
                        href="/dashboard/schedule"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#47664A] text-white text-xs font-semibold hover:bg-[#3B563E] transition-colors font-figtree"
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
            <div className="flex items-center gap-2 text-xs text-[#6C7B72] dark:text-[#A4B5A9] italic font-figtree">
              <span className="w-2 h-2 rounded-full bg-[#47664A] animate-ping" />
              <span>Analyzing anatomical alignment & routines...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts Strip */}
        <div className="p-3 border-t border-[#E5DFD4] dark:border-[#283E31] bg-[#FAF6EE]/60 dark:bg-[#15231A] flex items-center gap-2 overflow-x-auto font-figtree">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#1A2A21] border border-[#D1DBCF] dark:border-[#283E31] hover:border-[#47664A] text-[#29352F] dark:text-[#E8EFE8] shrink-0 transition-colors shadow-xs"
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
          className="p-4 border-t border-[#D1DBCF] dark:border-[#283E31] flex gap-2 font-figtree"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about yoga routines, alignments, or breathing..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] placeholder:text-[#6C7B72] focus:outline-none focus:ring-1 focus:ring-[#47664A]"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#47664A] hover:bg-[#3B563E] text-white rounded-xl px-5 py-2.5 shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

