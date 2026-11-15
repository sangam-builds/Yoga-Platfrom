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
      <div className="p-4 rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-figtree">
        <div className="flex items-center gap-2 max-w-sm w-full bg-[#FAF6EE] dark:bg-[#1A2A21] px-3 py-2 rounded-xl border border-[#D1DBCF] dark:border-[#283E31]">
          <Search className="w-4 h-4 text-[#637063]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by English or Sanskrit name (e.g. Adho Mukha, Warrior)..."
            className="w-full text-xs bg-transparent focus:outline-none text-[#29352F] dark:text-[#E8EFE8] placeholder:text-[#6C7B72]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6C7B72] dark:text-[#A4B5A9] font-medium">Difficulty:</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[#D1DBCF] dark:border-[#283E31] bg-[#FAF6EE] dark:bg-[#1A2A21] text-[#29352F] dark:text-[#E8EFE8] font-semibold"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      {/* ─── Poses Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-figtree">
        {poses.map((pose: any) => {
          const isFav = !!favorites[pose.id];

          return (
            <div
              key={pose.id}
              id={pose.slug}
              className="rounded-2xl bg-white dark:bg-[#18261E] border border-[#D1DBCF] dark:border-[#283E31] overflow-hidden shadow-xs hover:border-[#47664A] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="relative aspect-video bg-[#FAF6EE] overflow-hidden">
                <img
                  src={pose.imageUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"}
                  alt={pose.englishName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleFavorite(pose.id, pose.englishName)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-colors ${
                    isFav
                      ? "bg-rose-500 text-white"
                      : "bg-black/40 text-white hover:bg-black/60"
                  }`}
                  aria-label="Favorite pose"
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                </button>

                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-outfit uppercase tracking-wider bg-[#47664A]/90 text-white backdrop-blur-md">
                    {pose.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-outfit text-xl font-semibold text-[#29352F] dark:text-[#E8EFE8]">
                      {pose.englishName}
                    </h3>
                    {pose.sanskritName && (
                      <p className="font-figtree italic text-xs text-[#47664A] dark:text-[#8BB394] font-semibold">
                        {pose.sanskritName}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[#6C7B72] dark:text-[#A4B5A9] leading-relaxed">
                    {pose.description}
                  </p>
                </div>

                {/* Benefits */}
                {pose.benefits && pose.benefits.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#E5DFD4] dark:border-[#283E31]">
                    <span className="font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-[#607B6A]">
                      Anatomical Benefits
                    </span>
                    <ul className="space-y-1 text-xs text-[#29352F] dark:text-[#E8EFE8]">
                      {pose.benefits.map((b: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#47664A] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contraindications */}
                {pose.contraindications && pose.contraindications.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#FBF1F0] dark:bg-[#2C1818] border border-[#F0D5D3] dark:border-[#4A2424] text-xs text-[#A63A36] dark:text-[#F0B8B6] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#A63A36] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-outfit font-bold block text-[10px] uppercase tracking-wider">Contraindications</span>
                      <span className="font-figtree">{pose.contraindications.join(", ")}</span>
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

