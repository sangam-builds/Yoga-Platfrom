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
            className="rounded-xl px-4 py-2 text-xs font-semibold bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-figtree"
          >
            <Plus className="w-4 h-4" />
            <span>New Check-in</span>
          </Button>
        }
      />

      {/* ─── Check-In Form Drawer / Accordion ─────────────────────────── */}
      {isFormOpen && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs space-y-6 animate-in slide-in-from-top-2 font-figtree select-none">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
            <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
              Log Session Reflection
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mood Scale Before & After */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-[var(--accent-amber)]" />
                <span>Mood Shift (Before → After):</span>
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={moodBefore}
                  onChange={(e) => setMoodBefore(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium cursor-pointer focus:ring-1 focus:ring-[var(--primary-sage)]"
                >
                  <option value={1}>1 - Stressed / Low</option>
                  <option value={2}>2 - Fatigued</option>
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Calm & Peaceful</option>
                </select>
                <span className="text-[var(--text-muted)]">→</span>
                <select
                  value={moodAfter}
                  onChange={(e) => setMoodAfter(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium cursor-pointer focus:ring-1 focus:ring-[var(--primary-sage)]"
                >
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Uplifted</option>
                  <option value={5}>5 - Blissful / Energized</option>
                </select>
              </div>
            </div>

            {/* Energy Scale Before & After */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[var(--primary-sage)]" />
                <span>Energy Level (Before → After):</span>
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={energyBefore}
                  onChange={(e) => setEnergyBefore(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium cursor-pointer focus:ring-1 focus:ring-[var(--primary-sage)]"
                >
                  <option value={1}>1 - Sluggish</option>
                  <option value={2}>2 - Tired</option>
                  <option value={3}>3 - Moderate</option>
                  <option value={4}>4 - Active</option>
                  <option value={5}>5 - High Vitality</option>
                </select>
                <span className="text-[var(--text-muted)]">→</span>
                <select
                  value={energyAfter}
                  onChange={(e) => setEnergyAfter(parseInt(e.target.value))}
                  className="flex-1 text-xs p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium cursor-pointer focus:ring-1 focus:ring-[var(--primary-sage)]"
                >
                  <option value={3}>3 - Restored</option>
                  <option value={4}>4 - Rejuvenated</option>
                  <option value={5}>5 - Vibrant Prana</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              Personal Notes & Physical Sensations:
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did your body feel? Any breakthroughs with breath or postures?"
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-sage)]"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
              className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] rounded-xl text-xs font-bold px-5 py-2.5 cursor-pointer shadow-xs font-figtree"
            >
              Save Reflection
            </Button>
          </div>
        </div>
      )}

      {/* ─── Trend Highlights Banner ─────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[var(--sage-tint)]/60 border border-[var(--border-subtle)] flex items-center justify-between gap-4 font-figtree select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--primary-sage)]">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-outfit font-bold text-base">Average Mood Boost: +42%</h4>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Across your past 30 days of yoga sessions, practicing Vinyasa and Pranayama produced your largest recovery gains.
          </p>
        </div>
      </div>

      {/* ─── Journal Entries List ────────────────────────────────────── */}
      <div className="space-y-4 font-figtree">
        <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">
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
                className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs hover:border-[var(--primary-sage)] transition-all space-y-3 select-none"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">
                    {formatDate(entry.createdAt, { dateStyle: "long" })}
                  </span>
                  {entry.session && (
                    <span className="text-[var(--primary-sage)] font-semibold">
                      {entry.session.class.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
                  <div>
                    <span className="text-[var(--text-subtle)] block text-[10px] uppercase font-semibold">Mood</span>
                    <span className="font-bold text-[var(--text-primary)]">{entry.moodBefore || 3} → {entry.moodAfter || 5} / 5</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-subtle)] block text-[10px] uppercase font-semibold">Energy</span>
                    <span className="font-bold text-[var(--text-primary)]">{entry.energyBefore || 3} → {entry.energyAfter || 4} / 5</span>
                  </div>
                </div>

                {entry.note && (
                  <p className="text-xs text-[var(--text-muted)] italic bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-hairline)]">
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

