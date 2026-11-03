"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Video,
  Play,
  Pause,
  Clock,
  Sparkles,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { PageHeader, StatusBadge, EmptyState } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function RecordingsLibraryPage() {
  const { t, formatDate } = useI18n();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const recordings = [
    {
      id: "rec-1",
      title: "Himalayan Sunrise Vinyasa Flow",
      instructor: "Priya Sharma",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: "45 mins",
      style: "VINYASA",
      expiry: "Available for 5 more days",
      thumbnailUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      watched: false,
    },
    {
      id: "rec-2",
      title: "Restorative Yin & Myofascial Release",
      instructor: "Meera Nair",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      duration: "60 mins",
      style: "YIN",
      expiry: "Available for 3 more days",
      thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      watched: true,
    },
    {
      id: "rec-3",
      title: "Hatha Alignment & Pranayama",
      instructor: "Aarav Patel",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      duration: "60 mins",
      style: "HATHA",
      expiry: "Available for 1 more day",
      thumbnailUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      watched: false,
    },
  ];

  const filtered = recordings.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Class Recordings & Replay"
        description="Revisit your favorite live masterclasses on your own schedule with our interactive video replay player."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Recordings" }]}
      />

      {/* ─── Search & Filters Bar ───────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recordings by title or instructor..."
            className="w-full text-xs bg-transparent focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* ─── Video Library Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs hover:border-[#6B8F71] transition-all flex flex-col justify-between group"
          >
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setPlayingVideo(item)}
                  className="w-12 h-12 rounded-full bg-white/90 text-[#233D32] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              </div>

              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                  {item.duration}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  {item.expiry}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h4 className="font-serif font-bold text-base text-gray-900 dark:text-white truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  With {item.instructor} • Recorded {formatDate(item.date)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold text-[#6B8F71]">{item.style}</span>
                {item.watched ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Watched</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400">New replay</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Video Player Modal */}
      {playingVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPlayingVideo(null)}
        >
          <div
            className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-900 flex items-center justify-between text-white">
              <h3 className="font-serif font-bold text-sm truncate">{playingVideo.title}</h3>
              <div className="flex items-center gap-3">
                {/* Speed Controls */}
                <div className="flex items-center gap-1 text-xs">
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-0.5 rounded-md ${
                        playbackSpeed === speed ? "bg-[#6B8F71] text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setPlayingVideo(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={playingVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                onPlay={(e) => {
                  (e.target as HTMLVideoElement).playbackRate = playbackSpeed;
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
