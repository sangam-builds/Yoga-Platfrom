"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Plus,
  Smile,
  Zap,
  Sparkles,
  Calendar,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader, EmptyState } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function JournalPage() {
  const { t, formatDate } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(5);
  const [energyBefore, setEnergyBefore] = useState(3);
  const [energyAfter, setEnergyAfter] = useState(4);
  const [note, setNote] = useState("");

  // Fetch Journal Entries
  const { data, isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: async () => {
      const res = await fetch("/api/journal");
      if (!res.ok) throw new Error("Failed to load journal");
      return res.json();
    },
  });

  // Create Entry Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodBefore,
          moodAfter,
          energyBefore,
          energyAfter,
          note,
        }),
      });
      if (!res.ok) throw new Error("Failed to save entry");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Journal Entry Recorded", "Your practice reflection has been preserved.");
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setIsFormOpen(false);
      setNote("");
    },
    onError: (err: any) => {
      toast.error("Failed to save journal", err.message);
    },
  });

  const entries = data?.entries || [];

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Mindfulness & Progress Journal"
        description="Track how your yoga practice elevates your daily mood, physical energy, and inner calm."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Journal" }]}
        action={
          <Button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="rounded-xl px-4 py-2 text-xs font-semibold bg-[#47664A] hover:bg-[#3B563E] text-white shadow-xs inline-flex items-center gap-1.5 font-figtree"
          >
            <Plus className="w-4 h-4" />
            <span>New Check-in</span>
          </Button>
        }
      />

      {/* ─── Check-In Form Drawer / Accordion ─────────────────────────── */}
      {isFormOpen && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] shadow-lg space-y-6 animate-in slide-in-from-top-2 font-figtree">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD4] dark:border-[#283E31]">
            <h3 className="font-outfit font-semibold text-base text-[#29352F] dark:text-[#E8EFE8]">
              Log Session Reflection
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-[#6C7B72] hover:text-[#29352F] dark:hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mood Scale Before & After */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8] flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[#D97706]" />
                <span>Mood Shift (Before → After):</span>
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] font-medium"
                >
                  <option value={1}>1 - Stressed / Low</option>
                  <option value={2}>2 - Fatigued</option>
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Calm & Peaceful</option>
                </select>
                <span className="text-[#8C9B92]">→</span>
                <select
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] font-medium"
                >
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Uplifted</option>
                  <option value={5}>5 - Blissful / Energized</option>
                </select>
              </div>
            </div>

            {/* Energy Scale Before & After */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#47664A]" />
                <span>Energy Level (Before → After):</span>
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={energyBefore}
                  onChange={(e) => setEnergyBefore(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] font-medium"
                >
                  <option value={1}>1 - Sluggish</option>
                  <option value={2}>2 - Tired</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - Active</option>
                  <option value={5}>5 - High Vitality</option>
                </select>
                <span className="text-[#8C9B92]">→</span>
                <select
                  value={energyAfter}
                  onChange={(e) => setEnergyAfter(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] font-medium"
                >
                  <option value={3}>3 - Restored</option>
                  <option value={4}>4 - Rejuvenated</option>
                  <option value={5}>5 - Vibrant Prana</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-[#29352F] dark:text-[#E8EFE8]">
              Personal Notes & Physical Sensations:
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did your body feel? Any breakthroughs with breath or postures?"
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] focus:outline-none focus:ring-1 focus:ring-[#47664A]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              className="bg-[#47664A] hover:bg-[#3B563E] text-white rounded-xl text-xs font-semibold px-5 py-2.5 shadow-xs font-figtree"
            >
              Save Reflection
            </Button>
          </div>
        </div>
      )}

      {/* ─── Trend Highlights Banner ─────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#E1EDDD]/50 dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] flex items-center justify-between gap-4 font-figtree">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#35523E] dark:text-[#A7C7A8]">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-outfit font-semibold text-base">Average Mood Boost: +42%</h4>
          </div>
          <p className="text-xs text-[#6C7B72] dark:text-[#A4B5A9]">
            Across your past 30 days of yoga sessions, practicing Vinyasa and Pranayama produced your largest recovery gains.
          </p>
        </div>
      </div>

      {/* ─── Journal Entries List ────────────────────────────────────── */}
      <div className="space-y-4 font-figtree">
        <h3 className="font-outfit font-semibold text-lg text-[#29352F] dark:text-[#E8EFE8]">
          Past Reflections ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <EmptyState
            title="Your Journal is Waiting"
            description="Mindful journaling after yoga helps identify stress triggers and reinforces neuroplasticity gains. Log your first check-in above!"
            action={{ label: "Log First Check-in", onClick: () => setIsFormOpen(true) }}
          />
        ) : (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-outfit font-semibold text-[#29352F] dark:text-[#E8EFE8]">
                    {formatDate(entry.createdAt, { dateStyle: "long" })}
                  </span>
                  {entry.session && (
                    <span className="text-[#47664A] dark:text-[#8BB394] font-semibold">
                      {entry.session.class.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-xs text-[#6C7B72] dark:text-[#A4B5A9]">
                  <div>
                    <span className="text-[10px] uppercase font-outfit tracking-wider text-[#607B6A] block">Mood</span>
                    <span className="font-outfit font-semibold text-[#29352F] dark:text-[#E8EFE8]">{entry.moodBefore || 3} → {entry.moodAfter || 5} / 5</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-outfit tracking-wider text-[#607B6A] block">Energy</span>
                    <span className="font-outfit font-semibold text-[#29352F] dark:text-[#E8EFE8]">{entry.energyBefore || 3} → {entry.energyAfter || 4} / 5</span>
                  </div>
                </div>

                {entry.note && (
                  <p className="text-xs text-[#29352F] dark:text-[#E8EFE8] italic bg-[#FAF6EE] dark:bg-[#15231A] border border-[#E5DFD4] dark:border-[#283E31] p-3 rounded-xl">
                    &ldquo;{entry.note}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

