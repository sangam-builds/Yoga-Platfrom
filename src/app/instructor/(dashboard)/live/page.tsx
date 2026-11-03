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
      <div className="bg-[#1A2F26] text-white p-4 rounded-2xl border border-[#305344] flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6B8F71] flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg">
                Vinyasa Flow Studio Room
              </span>
              {isSessionActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live Broadcast
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A8C2AC] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isSessionActive ? `Class Time: ${formatTimer(timerSeconds)}` : "Not Started"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold gap-2 shadow-md animate-pulse"
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
                className={`text-xs gap-1.5 ${
                  isRecording ? "bg-red-600 text-white animate-pulse" : "bg-white/10 text-stone-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-white" : "bg-red-400"}`} />
                {isRecording ? "Recording Active" : "Record Session"}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsLocked(!isLocked);
                  toast.info(isLocked ? "Room unlocked." : "Room locked: new joins prevented.");
                }}
                className={`text-xs border-white/20 gap-1.5 ${
                  isLocked ? "bg-amber-500/20 text-amber-300 border-amber-400" : "text-white bg-white/5"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                {isLocked ? "Locked" : "Lock Room"}
              </Button>

              <Button
                size="sm"
                onClick={handleEndSession}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold gap-1.5 shadow-xs"
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
          <div className="relative aspect-video bg-[#1B2922] rounded-3xl overflow-hidden border border-[#305344] flex flex-col justify-between p-4 shadow-xl">
            {/* Top Bar inside Stage */}
            <div className="flex items-center justify-between text-white text-xs z-10">
              <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md font-mono text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Host Feed • 1080p 60fps
              </span>

              {isRecording && (
                <span className="px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md font-mono text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  REC
                </span>
              )}
            </div>

            {/* Central Placeholder when video is previewing */}
            <div className="flex flex-col items-center justify-center text-center space-y-3 z-10">
              <div className="w-20 h-20 rounded-full bg-[#233D32] border-2 border-[#6B8F71] text-white flex items-center justify-center shadow-xl">
                {isVideoOff ? <VideoOff className="w-8 h-8 text-stone-400" /> : <Video className="w-8 h-8 text-[#A8C2AC]" />}
              </div>
              <div>
                <p className="font-serif font-bold text-white text-lg">
                  Teacher Stage • Camera {isVideoOff ? "Disabled" : "Active"}
                </p>
                <p className="text-xs text-[#A8C2AC]">
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
                className={`p-3 rounded-full transition-all shadow-md ${
                  isMuted ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3 rounded-full transition-all shadow-md ${
                  isVideoOff ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"
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
                className="aspect-video bg-white rounded-2xl border border-[#E9E2D0] p-2 flex flex-col justify-between text-xs relative overflow-hidden shadow-2xs hover:border-[#6B8F71]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#233D32] truncate">
                    {p.name}
                  </span>
                  {p.handRaised && (
                    <span className="p-1 rounded-full bg-amber-100 text-amber-700 animate-bounce" title="Raised hand">
                      <Hand className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#6B8F71]/15 text-[#233D32] flex items-center justify-center font-bold text-xs">
                    {p.name.charAt(0)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100">
                  <span>{p.isMuted ? "Muted" : "Unmuted"}</span>
                  {p.injury && (
                    <span className="text-amber-600 font-bold" title={p.injury}>
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
          <div className="bg-white p-1 rounded-2xl border border-[#E9E2D0] flex items-center justify-between shadow-xs text-xs font-semibold">
            <button
              onClick={() => setActiveSidePanel("participants")}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                activeSidePanel === "participants"
                  ? "bg-[#6B8F71] text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Roster ({participants.length})
            </button>
            <button
              onClick={() => setActiveSidePanel("chat")}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                activeSidePanel === "chat"
                  ? "bg-[#6B8F71] text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Chat ({chatMessages.length})
            </button>
            <button
              onClick={() => setActiveSidePanel("sequence")}
              className={`flex-1 py-2 text-center rounded-xl transition-all ${
                activeSidePanel === "sequence"
                  ? "bg-[#6B8F71] text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Sequence
            </button>
          </div>

          {/* Panel: Participants */}
          {activeSidePanel === "participants" && (
            <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9E2D0]">
                <h4 className="font-serif font-bold text-sm text-[#233D32]">
                  Live Attendees ({participants.length})
                </h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setParticipants((prev) => prev.map((p) => ({ ...p, isMuted: true })));
                    toast.info("All participants muted.");
                  }}
                  className="text-[11px] text-stone-600 hover:text-stone-900 h-7 px-2"
                >
                  <VolumeX className="w-3.5 h-3.5 mr-1" />
                  Mute All
                </Button>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800">{p.name}</span>
                        {p.handRaised && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-800 font-bold">
                            Hand Raised
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleMuteParticipant(p.id)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                          title="Toggle Mute"
                        >
                          {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-red-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleRemoveParticipant(p.id, p.name)}
                          className="p-1 text-stone-400 hover:text-red-600"
                          title="Remove Participant"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Discreet Injury Health Alert (Section 5.4: Only agreed health note) */}
                    {p.injury && (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
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
            <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs flex flex-col h-[450px] justify-between">
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs space-y-0.5">
                    <span className="font-bold text-stone-700 text-[11px]">
                      {msg.sender}:
                    </span>
                    <p className="p-2 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-stone-800">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E9E2D0] flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Post announcement or reply..."
                  className="flex-1 px-3 py-1.5 text-xs bg-[#F8F7F2] border border-[#E9E2D0] rounded-xl focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
                />
                <Button size="sm" type="submit" className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs px-3">
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* Panel: Pose Sequence Lesson Plan (Section 5.11 & 5.4) */}
          {activeSidePanel === "sequence" && (
            <div className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-3 max-h-[450px] overflow-y-auto">
              <div className="pb-2 border-b border-[#E9E2D0]">
                <h4 className="font-serif font-bold text-sm text-[#233D32] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#6B8F71]" />
                  Session Lesson Plan & Poses
                </h4>
                <p className="text-[11px] text-stone-500">Visible only to the instructor</p>
              </div>

              <div className="space-y-2">
                {sequencePoses.map((p, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-stone-800">
                      <span>{idx + 1}. {p.name}</span>
                      <span className="text-[10px] font-mono text-[#6B8F71]">{p.duration}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 italic">Cue: {p.cue}</p>
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
