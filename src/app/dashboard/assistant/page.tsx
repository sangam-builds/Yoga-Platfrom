"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

interface SuggestedClass {
  id: string;
  title: string;
  instructorName?: string;
  style?: string;
  level?: string;
  durationMin?: number;
}

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  suggestedClasses?: SuggestedClass[];
  source?: "gemini" | "fallback";
}

/**
 * Lightweight helper to format markdown-style text safely without bulky dependencies.
 */
function FormattedMessageText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.replace(/^[•\-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-[var(--primary-sage)] mt-1.5 text-xs select-none">•</span>
              <span>{renderInlineMarkdown(content)}</span>
            </div>
          );
        }

        // Numbered list
        const matchNumber = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (matchNumber) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-bold text-[var(--primary-sage)] text-xs min-w-[16px]">
                {matchNumber[1]}.
              </span>
              <span>{renderInlineMarkdown(matchNumber[2])}</span>
            </div>
          );
        }

        // Heading / Section
        if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
          return (
            <h4
              key={idx}
              className="font-outfit font-bold text-sm text-[var(--text-primary)] pt-1"
            >
              {renderInlineMarkdown(trimmed.replace(/^#+\s+/, ""))}
            </h4>
          );
        }

        return <p key={idx}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Regex to match **bold** or *italic*
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-[var(--text-primary)]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="italic text-[var(--primary-sage)]">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
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
      text: "Namaste! I am your ZenFlow AI Wellness & Yoga Advisor. I can build personalized asana sequences, provide anatomical posture guidance, or recommend studio classes tailored to your body and goals.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/assistant/chat");
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            const loaded: ChatMessage[] = data.history.map(
              (m: { id: string; role: "user" | "assistant"; content: string }) => ({
                id: m.id,
                sender: m.role,
                text: m.content,
              })
            );
            setMessages(loaded);
          }
        }
      } catch {
        // Continue with initial message if history retrieval fails
      }
    }
    loadHistory();
  }, []);

  const suggestedPrompts = [
    "Build me a 4-week yoga routine",
    "Help with lower back & hip stiffness",
    "Recommend morning live classes",
    "Pranayama techniques for mental focus",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: "bot-" + Date.now(),
        sender: "assistant",
        text: data.reply,
        suggestedClasses: data.suggestedClasses,
        source: data.source,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not connect to AI advisor.";
      toast.error("Assistant Notice", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch("/api/assistant/chat", { method: "DELETE" });
      setMessages([
        {
          id: "intro-reset",
          sender: "assistant",
          text: "Namaste! Conversation reset. How may I support your practice today?",
        },
      ]);
      toast.success("Conversation Cleared", "Started a fresh wellness session.");
    } catch {
      toast.error("Error", "Could not clear conversation.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <PageHeader
        title="AI Wellness & Sequence Assistant"
        description="Receive personalized practice guidance adapting to your goals, physical constraints, and daily energy."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "AI Assistant" }]}
      />

      {/* ─── Medical Disclaimer Callout ─────────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-[var(--accent-amber-tint)] border border-[var(--accent-amber)]/20 flex items-start gap-2.5 text-xs text-[var(--accent-amber)] font-figtree select-none">
        <AlertTriangle className="w-4 h-4 text-[var(--accent-amber)] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Medical Disclaimer:</strong> ZenFlow AI provides mindful wellness guidance and alignment suggestions, not medical diagnosis or therapy. Consult a physician for acute injuries or pain.
        </p>
      </div>

      {/* ─── Chat Window ────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs flex flex-col h-[620px] overflow-hidden font-figtree">
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
                    ? "bg-[var(--primary-sage)] text-[var(--on-primary)]"
                    : "bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] shadow-2xs"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[var(--primary-sage)] text-[var(--on-primary)] rounded-tr-none shadow-xs whitespace-pre-wrap"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-hairline)] shadow-2xs"
                }`}
              >
                {m.sender === "user" ? (
                  m.text
                ) : (
                  <FormattedMessageText text={m.text} />
                )}

                {/* Suggested Class Routine Cards */}
                {m.suggestedClasses && m.suggestedClasses.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-[var(--border-hairline)] space-y-2">
                    <span className="text-[10px] uppercase font-outfit tracking-wider text-[var(--primary-sage)] font-bold block">
                      Recommended ZenFlow Live Sessions
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {m.suggestedClasses.map((cls) => (
                        <Link
                          key={cls.id || cls.title}
                          href="/dashboard/schedule"
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--sage-tint)] border border-[var(--border-subtle)] transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--primary-sage)] truncate">
                              {cls.title}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] truncate">
                              {cls.instructorName || "Studio Instructor"}
                              {cls.durationMin ? ` • ${cls.durationMin}m` : ""}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[var(--text-subtle)] group-hover:text-[var(--primary-sage)] shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] italic pl-11">
              <span className="w-2 h-2 rounded-full bg-[var(--primary-sage)] animate-ping" />
              <span>Analyzing anatomical alignment & routines...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Strip */}
        <div className="p-3 border-t border-[var(--border-hairline)] bg-[var(--bg-elevated)]/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {suggestedPrompts.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--primary-sage)] text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 transition-colors cursor-pointer"
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
          className="p-4 border-t border-[var(--border-hairline)] flex gap-2 bg-[var(--bg-surface)]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about yoga routines, alignments, or breathing..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)]"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] rounded-2xl px-5 py-2.5 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
