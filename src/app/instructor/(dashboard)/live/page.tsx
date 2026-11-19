"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Users,
  MessageSquare,
  Play,
  Square,
  Lock,
  Hand,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  VolumeX,
  UserX,
  Share2,
  CheckCircle2,
  ChevronRight,
  Shield,
  Layers,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorLiveStudioPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || "demo-session";
  const { toast } = useToast();

  // Studio states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<"participants" | "chat" | "sequence">("participants");
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Pre-class checklist items
  const [checklist, setChecklist] = useState({
    micChecked: true,
    cameraChecked: true,
    propsReady: true,
    lessonPlanReviewed: true,
  });

  // Mock live participants
  const [participants, setParticipants] = useState([
    {
      id: "u1",
      name: "Priya Sharma",
      isMuted: true,
      hasVideo: true,
      handRaised: false,
      injury: "Mild lumbar tension (L4-L5)",
      joinedMinutesAgo: 12,
    },
    {
      id: "u2",
      name: "Arjun Verma",
      isMuted: true,
      hasVideo: true,
      handRaised: true,
      injury: null,
      joinedMinutesAgo: 10,
    },
    {
      id: "u3",
      name: "Ananya Rao",
      isMuted: true,
      hasVideo: false,
      handRaised: false,
      injury: "Wrist sprain (avoid full weight on hands)",
      joinedMinutesAgo: 8,
    },
    {
      id: "u4",
      name: "Dev Patel",
      isMuted: false,
      hasVideo: true,
      handRaised: false,
      injury: null,
      joinedMinutesAgo: 5,
    },
  ]);

  // Chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Priya", text: "Namaste teacher! Ready for morning flow 🙏" },
    { id: 2, sender: "Arjun", text: "Can you review the modifications for high lunge today?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Pose sequence / lesson plan
  const sequencePoses = [
    { name: "Pranayama & Centering", duration: "5 min", cue: "Ujjayi breath, spine lengthening" },
    { name: "Cat-Cow & Wrist Warmup", duration: "5 min", cue: "Gentle spinal flexion and extension" },
    { name: "Surya Namaskar A (3 Rounds)", duration: "10 min", cue: "Synchronize breath with movement" },
    { name: "Surya Namaskar B (2 Rounds)", duration: "10 min", cue: "Warrior I transitions with core engagement" },
    { name: "Standing Balance: Vrksasana", duration: "8 min", cue: "Tree pose, soft gaze, steady drishti" },
    { name: "Seated Hip Openers: Baddha Konasana", duration: "10 min", cue: "External hip rotation, supported with blocks" },
    { name: "Cool Down & Savasana", duration: "12 min", cue: "Complete nervous system restoration" },
  ];

  // Timer counter
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    toast.success("Live Studio Room launched! Status set to LIVE.");
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this live session for all practitioners?")) {
      setIsSessionActive(false);
      setIsRecording(false);
      toast.success("Session ended. Status set to COMPLETED and attendance recomputed.");
    }
  };

  const handleToggleMuteParticipant = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMuted: !p.isMuted } : p))
    );
  };

  const handleRemoveParticipant = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from this session? (Logged to audit trail)`)) {
      setParticipants((prev) => prev.filter((p) => p.id !== id));
      toast.info(`${name} removed and logged to audit trail.`);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "You (Teacher)", text: chatInput.trim() },
    ]);
    setChatInput("");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Studio Control Bar */}
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] p-4 rounded-2xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-outfit font-bold text-base sm:text-lg text-[var(--text-primary)]">
                Vinyasa Flow Studio Room
              </span>
              {isSessionActive && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] flex items-center gap-1 font-figtree">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--negative-rose)] animate-pulse" />
                  Live Broadcast
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] font-figtree">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                {isSessionActive ? `Class Time: ${formatTimer(timerSeconds)}` : "Not Started"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                {participants.length} Active Practitioners
              </span>
            </div>
          </div>
        </div>

        {/* Studio Primary Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isSessionActive ? (
            <Button
              onClick={handleStartSession}
              className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs font-bold gap-2 shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Live Studio (Host)
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => {
                  setIsRecording(!isRecording);
                  toast.info(isRecording ? "Recording paused." : "Recording started with practitioner consent notice.");
                }}
                className={`text-xs gap-1.5 cursor-pointer ${
                  isRecording ? "bg-[var(--negative-rose)] text-white animate-pulse" : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--sage-tint)]"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-white" : "bg-[var(--negative-rose)]"}`} />
                {isRecording ? "Recording Active" : "Record Session"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsLocked(!isLocked);
                  toast.info(isLocked ? "Room unlocked." : "Room locked: new joins prevented.");
                }}
                className={`text-xs gap-1.5 cursor-pointer ${
                  isLocked ? "bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] border-[var(--accent-amber)]/40" : "text-[var(--text-primary)] bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                {isLocked ? "Locked" : "Lock Room"}
              </Button>

              <Button
                size="sm"
                onClick={handleEndSession}
                className="bg-[var(--negative-rose)] hover:opacity-90 text-white text-xs font-bold gap-1.5 shadow-xs cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                End Session for All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Studio Arena: Video + Controls + Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stage / Video Feed (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-[var(--bg-elevated)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] flex flex-col justify-between p-4 shadow-xs">
            {/* Top Bar inside Stage */}
            <div className="flex items-center justify-between text-[var(--text-primary)] text-xs z-10">
              <span className="px-3 py-1 rounded-full bg-[var(--bg-surface)]/80 backdrop-blur-md font-figtree text-[11px] flex items-center gap-2 border border-[var(--border-hairline)] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[var(--primary-sage)]" />
                Host Feed • 1080p 60fps
              </span>

              {isRecording && (
                <span className="px-3 py-1 rounded-full bg-[var(--negative-rose-tint)] text-[var(--negative-rose)] border border-[var(--negative-rose)]/20 font-figtree text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[var(--negative-rose)]" />
                  REC
                </span>
              )}
            </div>

            {/* Central Placeholder when video is previewing */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 z-10">
              <div className="w-20 h-20 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] border-2 border-[var(--border-subtle)] flex items-center justify-center shadow-xs">
                {isVideoOff ? <VideoOff className="w-8 h-8 text-[var(--text-subtle)]" /> : <Video className="w-8 h-8 text-[var(--primary-sage)]" />}
              </div>
              <div>
                <p className="font-outfit font-bold text-[var(--text-primary)] text-lg">
                  Teacher Stage • Camera {isVideoOff ? "Disabled" : "Active"}
                </p>
                <p className="text-xs text-[var(--text-muted)] font-figtree">
                  {isSessionActive
                    ? "Practitioners are currently viewing your stream."
                    : "Pre-class room ready. Check audio and camera below before launching."}
                </p>
              </div>
            </div>

            {/* Bottom Controls inside Stage */}
            <div className="flex items-center justify-center gap-3 z-10">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-full transition-all shadow-md cursor-pointer ${
                  isMuted ? "bg-[var(--negative-rose)] text-white" : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full transition-all shadow-md cursor-pointer ${
                  isVideoOff ? "bg-[var(--negative-rose)] text-white" : "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]"
                }`}
                title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Participant Grid Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {participants.map((p) => (
              <div
                key={p.id}
                className="aspect-video bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-2.5 flex flex-col justify-between text-xs relative overflow-hidden shadow-2xs hover:border-[var(--primary-sage)]/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-outfit font-bold text-[11px] text-[var(--text-primary)] truncate">
                    {p.name}
                  </span>
                  {p.handRaised && (
                    <span className="p-1 rounded-full bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] animate-bounce" title="Raised hand">
                      <Hand className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center font-outfit font-bold text-xs">
                    {p.name.charAt(0)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-subtle)] pt-1 border-t border-[var(--border-hairline)] font-figtree">
                  <span>{p.isMuted ? "Muted" : "Unmuted"}</span>
                  {p.injury && (
                    <span className="text-[var(--accent-amber)] font-bold" title={p.injury}>
                      ⚠️ Flag
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panels: Participants, Chat, and Pose Sequence (1 col) */}
        <div className="space-y-4">
          {/* Panel Selector */}
          <div className="bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between shadow-2xs text-xs font-semibold font-figtree">
            <button
              onClick={() => setActiveSidePanel("participants")}
              className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
                activeSidePanel === "participants"
                  ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Roster ({participants.length})
            </button>
            <button
              onClick={() => setActiveSidePanel("chat")}
              className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
                activeSidePanel === "chat"
                  ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Chat ({chatMessages.length})
            </button>
            <button
              onClick={() => setActiveSidePanel("sequence")}
              className={`flex-1 py-2 text-center rounded-xl transition-all cursor-pointer ${
                activeSidePanel === "sequence"
                  ? "bg-[var(--primary-sage)] text-[var(--on-primary)] shadow-2xs font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              Sequence
            </button>
          </div>

          {/* Panel: Participants */}
          {activeSidePanel === "participants" && (
            <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                <h4 className="font-outfit font-bold text-sm text-[var(--text-primary)]">
                  Live Attendees ({participants.length})
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })));
                    toast.info("All participants muted.");
                  }}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] h-7 px-2 cursor-pointer font-figtree"
                >
                  <VolumeX className="w-3.5 h-3.5 mr-1" />
                  Mute All
                </Button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] space-y-1.5 text-xs font-figtree"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{p.name}</span>
                        {p.handRaised && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] font-bold">
                            Hand Raised
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleMuteParticipant(p.id)}
                          className="p-1 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Toggle Mute"
                        >
                          {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-[var(--negative-rose)]" /> : <Mic className="w-3.5 h-3.5 text-[var(--primary-sage)]" />}
                        </button>
                        <button
                          onClick={() => handleRemoveParticipant(p.id, p.name)}
                          className="p-1 text-[var(--text-subtle)] hover:text-[var(--negative-rose)] cursor-pointer"
                          title="Remove Participant"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Discreet Injury Health Alert (Section 5.4: Only agreed health note) */}
                    {p.injury && (
                      <div className="p-2 rounded-lg bg-[var(--accent-amber-tint)] border border-[var(--accent-amber)]/20 text-[var(--accent-amber)] text-[11px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[var(--accent-amber)] shrink-0 mt-0.5" />
                        <span><strong>Health Alert:</strong> {p.injury}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel: Chat */}
          {activeSidePanel === "chat" && (
            <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs flex flex-col h-[450px] justify-between">
              <div className="space-y-3 overflow-y-auto flex-1 pr-1 font-figtree">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs space-y-0.5">
                    <span className="font-bold text-[var(--text-muted)] text-[11px]">
                      {msg.sender}:
                    </span>
                    <p className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-[var(--text-primary)]">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="pt-3 border-t border-[var(--border-hairline)] flex gap-2 font-figtree">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Post announcement or reply..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] outline-none"
                />
                <Button size="sm" type="submit" className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs px-3 cursor-pointer shadow-xs">
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* Panel: Pose Sequence Lesson Plan (Section 5.11 & 5.4) */}
          {activeSidePanel === "sequence" && (
            <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-3 max-h-[450px] overflow-y-auto">
              <div className="pb-2 border-b border-[var(--border-hairline)]">
                <h4 className="font-outfit font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[var(--primary-sage)]" />
                  Session Lesson Plan & Poses
                </h4>
                <p className="text-[11px] text-[var(--text-subtle)] font-figtree">Visible only to the instructor</p>
              </div>

              <div className="space-y-2 font-figtree">
                {sequencePoses.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                      <span>{idx + 1}. {p.name}</span>
                      <span className="text-[10px] font-figtree text-[var(--primary-sage)] font-bold">{p.duration}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] italic">Cue: {p.cue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
