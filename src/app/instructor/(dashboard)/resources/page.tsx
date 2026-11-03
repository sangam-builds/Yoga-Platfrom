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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Teaching Tools & Sequences
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Curriculum & Resources
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Access Sanskrit pose encyclopedia, build reusable lesson plan sequences, and attach playlists.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-[#E9E2D0] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("poses")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
              activeTab === "poses" ? "bg-[#6B8F71] text-white shadow-2xs" : "text-stone-600"
            }`}
          >
            Pose Library
          </button>
          <button
            onClick={() => setActiveTab("sequences")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
              activeTab === "sequences" ? "bg-[#6B8F71] text-white shadow-2xs" : "text-stone-600"
            }`}
          >
            Sequences
          </button>
          <button
            onClick={() => setActiveTab("music")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${
              activeTab === "music" ? "bg-[#6B8F71] text-white shadow-2xs" : "text-stone-600"
            }`}
          >
            Playlists
          </button>
        </div>
      </div>

      {activeTab === "poses" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pose in English or Sanskrit..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E9E2D0] rounded-xl focus:ring-2 focus:ring-[#6B8F71]/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {samplePoses.map((pose) => (
              <div
                key={pose.english}
                className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-2 hover:border-[#6B8F71]/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6B8F71]/10 text-[#6B8F71] font-bold">
                    {pose.level}
                  </span>
                  <BookOpen className="w-4 h-4 text-stone-400" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#233D32]">
                  {pose.english}
                </h3>
                <p className="text-xs font-serif italic text-stone-500">
                  {pose.sanskrit}
                </p>
                <p className="text-xs text-stone-600 leading-relaxed pt-1 border-t border-[#E9E2D0]">
                  {pose.benefits}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "sequences" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sequences.map((seq) => (
              <div key={seq.title} className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                  <span>{seq.style}</span>
                  <span>{seq.duration}</span>
                </div>
                <h3 className="font-serif font-bold text-base text-[#233D32]">{seq.title}</h3>
                <p className="text-xs text-stone-600 font-mono">{seq.posesCount} sequenced postures</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Sequence template attached to active session plan.")}
                  className="w-full text-xs border-[#E9E2D0] hover:border-[#6B8F71]"
                >
                  Use as Lesson Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "music" && (
        <div className="bg-white p-8 rounded-3xl border border-[#E9E2D0] text-center space-y-3">
          <Music className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#233D32]">Spotify & Apple Music Playlists</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Attach ambient meditation, binaural beats, or acoustic guitar playlists to your scheduled classes.
          </p>
          <Button
            size="sm"
            onClick={() => toast.info("Playlist integration ready.")}
            className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Link New Playlist
          </Button>
        </div>
      )}
    </div>
  );
}
