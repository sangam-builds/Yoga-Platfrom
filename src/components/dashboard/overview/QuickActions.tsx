"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Plus, UserPlus, Bot, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/components/dashboard/shared/Toast";

export function QuickActions({ className = "" }: { className?: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    const link = `${window.location.origin}/signup?ref=zenflow-member`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied", "Share with friends to earn 2 bonus class credits!");
    setTimeout(() => setCopied(false), 2500);
  };

  const actions = [
    {
      id: "schedule",
      title: "Book a Class",
      desc: "Live daily flows with certified masters",
      icon: Calendar,
      href: "/dashboard/schedule",
    },
    {
      id: "credits",
      title: "Buy Credits",
      desc: "Save up to 25% on 5 and 10 class packs",
      icon: Plus,
      href: "/dashboard/membership#credit-packs",
    },
    {
      id: "refer",
      title: copied ? "Link Copied!" : "Invite a Friend",
      desc: "Earn 2 free credits when they join",
      icon: copied ? Check : UserPlus,
      onClick: handleCopyReferral,
    },
    {
      id: "assistant",
      title: "Ask AI Guru",
      desc: "Personalized flow routines and advice",
      icon: Bot,
      href: "/dashboard/assistant",
    },
  ];

  return (
    <div
      className={`rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-7 shadow-2xs select-none ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-outfit text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase">
          QUICK ACTIONS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;

          const content = (
            <div className="h-full p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hairline)] transition-all flex items-start gap-3.5 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-outfit font-semibold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                    {act.title}
                  </h5>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-subtle)] group-hover:text-[var(--primary-sage)] group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="font-figtree text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-snug">
                  {act.desc}
                </p>
              </div>
            </div>
          );

          return act.href ? (
            <Link key={act.id} href={act.href}>
              {content}
            </Link>
          ) : (
            <button key={act.id} type="button" onClick={act.onClick} className="text-left w-full">
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
