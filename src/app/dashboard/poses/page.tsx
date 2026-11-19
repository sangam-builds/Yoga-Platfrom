"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Search,
  Heart,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader, StatusBadge } from "@/components/dashboard/shared/UIBlocks";

export default function PoseLibraryPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["poses-library", searchQuery, difficultyFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);

      const res = await fetch(`/api/poses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load poses");
      return res.json();
    },
  });

  const toggleFavorite = (id: string, name: string) => {
    const isFav = !favorites[id];
    setFavorites((prev) => ({ ...prev, [id]: isFav }));
    if (isFav) {
      toast.success("Saved to Favorites", `${name} added to your personal asana library.`);
    }
  };

  const poses = data?.poses || [];

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Asana & Pose Library"
        description="Master foundational postures, anatomical benefits, and contraindications verified by ancient texts and modern biomechanics."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Poses" }]}
      />

      {/* ─── Search & Filters ───────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-figtree">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by English or Sanskrit name (e.g. Adho Mukha, Warrior)..."
            className="w-full text-xs bg-transparent focus:outline-none text-[var(--text-primary)] placeholder-[var(--text-subtle)] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--text-muted)] font-medium">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold cursor-pointer focus:ring-1 focus:ring-[var(--primary-sage)]"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* ─── Poses Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-figtree select-none">
        {poses.map((pose: any) => {
          const isFav = !!favorites[pose.id];

          return (
            <div
              key={pose.id}
              id={pose.slug}
              className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] overflow-hidden shadow-2xs hover:border-[var(--primary-sage)] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="relative aspect-video bg-[var(--border-hairline)] overflow-hidden">
                <img
                  src={pose.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"}
                  alt={pose.englishName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleFavorite(pose.id, pose.englishName)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                    isFav
                      ? "bg-[var(--negative-rose)] text-white"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                  aria-label="Favorite pose"
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                </button>

                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-md">
                    {pose.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-outfit text-xl font-bold text-[var(--text-primary)]">
                      {pose.englishName}
                    </h3>
                    {pose.sanskritName && (
                      <p className="font-outfit italic text-xs text-[var(--primary-sage)] font-semibold">
                        {pose.sanskritName}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {pose.description}
                  </p>
                </div>

                {/* Benefits */}
                {pose.benefits && pose.benefits.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-hairline)]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)] font-outfit">
                      Anatomical Benefits
                    </span>
                    <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                      {pose.benefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary-sage)] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contraindications */}
                {pose.contraindications && pose.contraindications.length > 0 && (
                  <div className="p-3 rounded-xl bg-[var(--negative-rose-tint)] border border-[var(--negative-rose-tint)] text-xs text-[var(--negative-rose)] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--negative-rose)] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-[10px] uppercase font-outfit">Contraindications</span>
                      <span>{pose.contraindications.join(", ")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

