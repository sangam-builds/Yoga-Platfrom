"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Hand,
  Maximize2,
  LogOut,
  MessageSquare,
  Sparkles,
  Star,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Users,
} from "lucide-react";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export default function LiveClassRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [inPreJoin, setInPreJoin] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [showPostClassSheet, setShowPostClassSheet] = useState(false);

  // Chat message state
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "Instructor Priya", text: "Namaste everyone! Welcome to today's flow. Please have a mat and block ready.", time: "7:00 AM" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Post-class feedback state
  const [postMood, setPostMood] = useState(5);
  const [postEnergy, setPostEnergy] = useState(4);
  const [postRating, setPostRating] = useState(5);
  const [postComment, setPostComment] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle local camera preview in pre-join
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCamOn && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          // Camera permission denied or not available
        });
    }
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isCamOn, inPreJoin]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setChatInput("");
  };

  const submitPostClassReview = async () => {
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moodAfter: postMood,
          energyAfter: postEnergy,
          note: postComment,
        }),
      });
      toast.success("Thank you for your practice!", "Post-class journal entry recorded.");
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  };

  // ─── 1. Pre-Join Check Screen ──────────────────────────────────────────
  if (inPreJoin) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 space-y-6 animate-in fade-in">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B8F71]">
            Pre-Flight Room Check
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Audio & Video Setup
          </h1>
          <p className="text-xs text-gray-500">
            Check your camera angle and microphone before joining your instructor on the mat.
          </p>
        </div>

        {/* Video Preview Frame */}
        <div className="relative aspect-video rounded-3xl bg-gray-950 overflow-hidden shadow-xl border border-gray-800 flex items-center justify-center">
          {isCamOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <VideoOff className="w-10 h-10" />
              <span className="text-xs">Camera is switched off</span>
            </div>
          )}

          {/* Quick toggle pill on preview */}
          <div className="absolute bottom-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-full backdrop-blur-md transition-colors ${
                isMicOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-rose-600 text-white"
              }`}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsCamOn(!isCamOn)}
              className={`p-3 rounded-full backdrop-blur-md transition-colors ${
                isCamOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-rose-600 text-white"
              }`}
            >
              {isCamOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span>Connection: HD Ready (54 Mbps)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Instructor is in the studio</span>
          </div>
        </div>

        {/* Join button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Button
            type="button"
            onClick={() => setInPreJoin(false)}
            className="bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-xl text-sm font-bold px-6 py-3 shadow-md"
          >
            Join Live Class Now 🧘
          </Button>
        </div>
      </div>
    );
  }

  // ─── 2. Post-Class Feedback Sheet ──────────────────────────────────────
  if (showPostClassSheet) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6 text-center animate-in zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
            Class Completed! How Was Your Practice?
          </h2>
          <p className="text-xs text-gray-500">
            Take a moment to record your mindfulness check-in for your streak.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-5 text-left">
          {/* Post-Class Mood (1-5) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Mood after class (1 = Low, 5 = Blissful):
            </span>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPostMood(val)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    postMood === val
                      ? "bg-[#6B8F71] text-white scale-110 shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {val === 1 ? "😔" : val === 3 ? "😐" : val === 5 ? "✨" : val}
                </button>
              ))}
            </div>
          </div>

          {/* Rating (1-5 Stars) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Rate Instructor & Session:
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPostRating(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                >
                  <Star className={`w-6 h-6 ${postRating >= star ? "fill-amber-400" : ""}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Optional Reflection Note */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Personal Reflection / Comment:
            </span>
            <textarea
              value={postComment}
              onChange={(e) => setPostComment(e.target.value)}
              placeholder="e.g. Felt deep hip release in Pigeon pose, great pace..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
            />
          </div>

          <Button
            type="button"
            onClick={submitPostClassReview}
            className="w-full bg-[#233D32] hover:bg-[#6B8F71] text-white rounded-xl text-xs font-bold py-3"
          >
            Save Journal & Finish
          </Button>
        </div>
      </div>
    );
  }

  // ─── 3. Active Classroom Screen ────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-950 rounded-3xl overflow-hidden shadow-2xl relative border border-gray-800 text-white animate-in fade-in">
      {/* Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <h2 className="font-serif text-sm sm:text-base font-bold">
            Live Room: Himalayan Sunrise Flow
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md">
            18 Yogis Practicing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 px-2 py-1 bg-black/40 rounded-lg">
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">HD Excellent</span>
          </div>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Video Stage */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-900">
          {/* Instructor Primary Feed */}
          <div className="w-full h-full relative">
            <img
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200"
              alt="Instructor Priya Teaching"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold">Instructor Priya Sharma (Host)</span>
            </div>
          </div>

          {/* Picture-in-Picture: Local User Feed */}
          <div className="absolute top-16 right-4 w-36 sm:w-48 aspect-video rounded-2xl bg-black/80 border border-white/20 shadow-xl overflow-hidden z-10">
            {isCamOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-[10px]">
                Camera Off
              </div>
            )}
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[9px]">
              You
            </div>
          </div>
        </div>

        {/* In-Class Chat Side Panel */}
        {isChatOpen && (
          <div className="w-80 border-l border-gray-800 bg-gray-900/95 flex flex-col z-20">
            <div className="p-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold">Class Chat</span>
              <button type="button" onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 p-3 space-y-3 overflow-y-auto text-xs">
              {messages.map((m, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-bold text-[#A7C4B5]">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-gray-200">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message class..."
                className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-gray-800 text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#6B8F71] text-xs font-bold text-white hover:bg-[#233D32]"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-3 sm:gap-4 z-20">
        <button
          type="button"
          onClick={() => setIsMicOn(!isMicOn)}
          className={`p-3.5 rounded-2xl transition-colors ${
            isMicOn ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-rose-600 text-white"
          }`}
          title={isMicOn ? "Mute" : "Unmute"}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsCamOn(!isCamOn)}
          className={`p-3.5 rounded-2xl transition-colors ${
            isCamOn ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-rose-600 text-white"
          }`}
          title={isCamOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsHandRaised(!isHandRaised);
            toast.info(isHandRaised ? "Hand lowered" : "Hand raised! Instructor notified.");
          }}
          className={`p-3.5 rounded-2xl transition-colors ${
            isHandRaised ? "bg-amber-500 text-gray-950 font-bold" : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
          title="Raise Hand"
        >
          <Hand className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3.5 rounded-2xl transition-colors ${
            isChatOpen ? "bg-[#6B8F71] text-white" : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
          title="Toggle Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsLeaveModalOpen(true)}
          className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors ml-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Confirmation Dialog on Leave */}
      <ConfirmDialog
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={() => {
          setIsLeaveModalOpen(false);
          setShowPostClassSheet(true);
        }}
        title="Leave Yoga Class?"
        description="Are you sure you want to exit the live yoga room? Your practice time will be recorded."
        confirmLabel="Leave Class"
        cancelLabel="Stay in Class"
        isDestructive={true}
      />
    </div>
  );
}

