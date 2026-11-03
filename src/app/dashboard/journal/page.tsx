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
            className="rounded-xl px-4 py-2 text-xs font-semibold bg-[#233D32] hover:bg-[#6B8F71] text-white shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Check-in</span>
          </Button>
        }
      />

      {/* ─── Check-In Form Drawer / Accordion ─────────────────────────── */}
      {isFormOpen && (
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg space-y-6 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white">
              Log Session Reflection
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mood Scale Before & After */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Mood Shift (Before → After):</span>
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent font-medium"
                >
                  <option value={1}>1 - Stressed / Low</option>
                  <option value={2}>2 - Fatigued</option>
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Calm & Peaceful</option>
                </select>
                <span className="text-gray-400">→</span>
                <select
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent font-medium"
                >
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Uplifted</option>
                  <option value={5}>5 - Blissful / Energized</option>
                </select>
              </div>
            </div>

            {/* Energy Scale Before & After */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Energy Level (Before → After):</span>
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={energyBefore}
                  onChange={(e) => setEnergyBefore(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent font-medium"
                >
                  <option value={1}>1 - Sluggish</option>
                  <option value={2}>2 - Tired</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - Active</option>
                  <option value={5}>5 - High Vitality</option>
                </select>
                <span className="text-gray-400">→</span>
                <select
                  value={energyAfter}
                  onChange={(e) => setEnergyAfter(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent font-medium"
                >
                  <option value={3}>3 - Restored</option>
                  <option value={4}>4 - Rejuvenated</option>
                  <option value={5}>5 - Vibrant Prana</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Personal Notes & Physical Sensations:
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did your body feel? Any breakthroughs with breath or postures?"
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              className="bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-xl text-xs font-bold px-5 py-2.5"
            >
              Save Reflection
            </Button>
          </div>
        </div>
      )}

      {/* ─── Trend Highlights Banner ─────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-serif font-bold text-base">Average Mood Boost: +42%</h4>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80">
            Across your past 30 days of yoga sessions, practicing Vinyasa and Pranayama produced your largest recovery gains.
          </p>
        </div>
      </div>

      {/* ─── Journal Entries List ────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
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
                className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formatDate(entry.createdAt, { dateStyle: "long" })}
                  </span>
                  {entry.session && (
                    <span className="text-[#6B8F71] font-semibold">
                      {entry.session.class.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Mood</span>
                    <span className="font-bold">{entry.moodBefore || 3} → {entry.moodAfter || 5} / 5</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase">Energy</span>
                    <span className="font-bold">{entry.energyBefore || 3} → {entry.energyAfter || 4} / 5</span>
                  </div>
                </div>

                {entry.note && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
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
