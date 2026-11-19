"use client";

import React, { useState } from "react";
import { FolderOpen, Search, BookOpen, Music, Plus, Sparkles, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorResourcesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"poses" | "sequences" | "music">("poses");
  const [search, setSearch] = useState("");

  const samplePoses = [
    {
      english: "Downward-Facing Dog",
      sanskrit: "Adho Mukha Svanasana",
      level: "All Levels",
      benefits: "Strengthens shoulders and arms, lengthens hamstrings and calves, energizes body.",
    },
    {
      english: "Warrior II",
      sanskrit: "Virabhadrasana II",
      level: "Beginner",
      benefits: "Builds stamina, opens hips and chest, develops concentration and balance.",
    },
    {
      english: "Tree Pose",
      sanskrit: "Vrksasana",
      level: "Beginner",
      benefits: "Strengthens thighs, calves, ankles and spine. Cultivates calm focus.",
    },
    {
      english: "Crow Pose",
      sanskrit: "Bakasana",
      level: "Intermediate",
      benefits: "Strengthens arms and wrists, tones abdominal muscles, builds core bravery.",
    },
    {
      english: "Corpse Pose",
      sanskrit: "Savasana",
      level: "All Levels",
      benefits: "Calms brain, reduces stress, lowers blood pressure, complete nervous integration.",
    },
  ];

  const sequences = [
    { title: "Vinyasa Peak: Arm Balance Flow", posesCount: 14, duration: "60 min", style: "Vinyasa" },
    { title: "Evening Restorative & Yin Stretches", posesCount: 8, duration: "45 min", style: "Yin" },
    { title: "Morning Sun Salutation Series", posesCount: 12, duration: "30 min", style: "Hatha" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Teaching Tools & Sequences
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Curriculum & Resources
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Access Sanskrit pose encyclopedia, build reusable lesson plan sequences, and attach playlists.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border-subtle)] self-start sm:self-auto shadow-2xs font-figtree">
          <button
            onClick={() => setActiveTab("poses")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "poses" ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Pose Library
          </button>
          <button
            onClick={() => setActiveTab("sequences")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "sequences" ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Sequences
          </button>
          <button
            onClick={() => setActiveTab("music")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "music" ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Playlists
          </button>
        </div>
      </div>

      {activeTab === "poses" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pose in English or Sanskrit..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] outline-none font-figtree"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {samplePoses.map((pose) => (
              <div
                key={pose.english}
                className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2 hover:border-[var(--primary-sage)]/60 transition-all font-figtree"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-figtree px-2.5 py-0.5 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] font-bold">
                    {pose.level}
                  </span>
                  <BookOpen className="w-4 h-4 text-[var(--text-subtle)]" />
                </div>
                <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                  {pose.english}
                </h3>
                <p className="text-xs font-outfit italic text-[var(--text-muted)]">
                  {pose.sanskrit}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1 border-t border-[var(--border-hairline)]">
                  {pose.benefits}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "sequences" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-figtree">
            {sequences.map((seq) => (
              <div key={seq.title} className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-3">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text-primary)]">{seq.style}</span>
                  <span className="text-[var(--text-subtle)]">{seq.duration}</span>
                </div>
                <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">{seq.title}</h3>
                <p className="text-xs text-[var(--text-muted)]">{seq.posesCount} sequenced postures</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Sequence template attached to active session plan.")}
                  className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--primary-sage)] cursor-pointer"
                >
                  Use as Lesson Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "music" && (
        <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-subtle)] text-center space-y-3 shadow-2xs font-figtree">
          <Music className="w-10 h-10 text-[var(--text-subtle)] mx-auto" />
          <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">Spotify & Apple Music Playlists</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Attach ambient meditation, binaural beats, or acoustic guitar playlists to your scheduled classes.
          </p>
          <Button
            size="sm"
            onClick={() => toast.info("Playlist integration ready.")}
            className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Link New Playlist
          </Button>
        </div>
      )}
    </div>
  );
}
