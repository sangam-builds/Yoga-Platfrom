"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  MoreVertical,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorClassesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New class form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("VINYASA");
  const [level, setLevel] = useState("ALL_LEVELS");
  const [durationMin, setDurationMin] = useState(60);
  const [capacity, setCapacity] = useState(25);
  const [propsNeeded, setPropsNeeded] = useState("Yoga Mat, Foam Blocks");
  const [benefits, setBenefits] = useState("Core strength, breath awareness, hip flexibility");
  const [recurrenceRule, setRecurrenceRule] = useState("FREQ=WEEKLY;BYDAY=MO,WE,FR");

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-classes", styleFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (styleFilter) params.set("style", styleFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/instructor/classes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load classes");
      return res.json();
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/instructor/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          style,
          level,
          durationMin: Number(durationMin),
          capacity: Number(capacity),
          propsNeeded: propsNeeded.split(",").map((s) => s.trim()).filter(Boolean),
          benefits: benefits.split(",").map((s) => s.trim()).filter(Boolean),
          recurrenceRule,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");
      return data;
    },
    onSuccess: () => {
      toast.success("Class created successfully!");
      queryClient.invalidateQueries({ queryKey: ["instructor-classes"] });
      setIsCreateModalOpen(false);
      setTitle("");
      setDescription("");
    },
    onError: (err: any) => {
      toast.error(err.message);
    },
  });

  const classes = data?.classes || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Curriculum & Definitions
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            My Teaching Classes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Define recurring yoga styles, set practitioner capacity, props needed, and manage series.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class title or description..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E9E2D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-[#E9E2D0] rounded-xl text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30"
          >
            <option value="">All Styles</option>
            <option value="VINYASA">Vinyasa</option>
            <option value="HATHA">Hatha</option>
            <option value="ASHTANGA">Ashtanga</option>
            <option value="YIN">Yin</option>
            <option value="PRANAYAMA">Pranayama</option>
            <option value="MEDITATION">Meditation</option>
          </select>
        </div>
      </div>

      {/* Class Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-stone-100 animate-pulse rounded-2xl border border-[#E9E2D0]" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9E2D0] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F7F2] text-[#6B8F71] flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#233D32]">No Classes Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't defined any yoga classes matching your search. Create a new series to start offering scheduled sessions.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create First Class
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls: any) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-[#E9E2D0] p-5 shadow-xs flex flex-col justify-between hover:border-[#6B8F71]/50 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#6B8F71]/10 text-[#6B8F71] font-bold">
                    {cls.style} • {cls.level.replace("_", " ")}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    cls.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                  }`}>
                    {cls.isActive ? "Active Series" : "Inactive"}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#233D32]">
                  {cls.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {cls.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E9E2D0]">
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#6B8F71]" />
                    <span>{cls.durationMin} minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#6B8F71]" />
                    <span>Cap: {cls.capacity} students</span>
                  </div>
                </div>

                {cls.recurrenceRule && (
                  <p className="text-[10px] font-mono text-stone-400 truncate">
                    Recurrence: {cls.recurrenceRule}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-stone-500">
                    <strong>{cls.totalSessionsCount}</strong> total sessions
                  </span>
                  <Link href={`/instructor/schedule?class=${cls.id}`}>
                    <Button size="sm" variant="outline" className="text-xs border-[#E9E2D0] hover:border-[#6B8F71]">
                      View Schedule
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-[#E9E2D0] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#233D32]">
                  New Yoga Class Definition
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createClassMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Awakening Vinyasa"
                  className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe flow rhythm, theme, breathing focus, and target benefits..."
                  className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Style *
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl bg-white"
                  >
                    <option value="VINYASA">Vinyasa Flow</option>
                    <option value="HATHA">Hatha Yoga</option>
                    <option value="ASHTANGA">Ashtanga Primary</option>
                    <option value="YIN">Yin & Deep Stretch</option>
                    <option value="PRANAYAMA">Pranayama Breathwork</option>
                    <option value="MEDITATION">Mindfulness Meditation</option>
                    <option value="POWER">Power Yoga</option>
                    <option value="RESTORATIVE">Restorative</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl bg-white"
                  >
                    <option value="ALL_LEVELS">All Levels Welcome</option>
                    <option value="BEGINNER">Beginner Friendly</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Practitioner Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Props Needed (comma separated)
                </label>
                <input
                  type="text"
                  value={propsNeeded}
                  onChange={(e) => setPropsNeeded(e.target.value)}
                  placeholder="Yoga mat, 2 blocks, strap"
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Key Benefits (comma separated)
                </label>
                <input
                  type="text"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Improved posture, spine alignment, mental clarity"
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Recurrence Rule (RFC 5545 RRULE)
                </label>
                <input
                  type="text"
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value)}
                  placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl font-mono text-stone-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E9E2D0]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClassMutation.isPending}
                  className="bg-[#6B8F71] hover:bg-[#58775D] text-white"
                >
                  {createClassMutation.isPending ? "Creating..." : "Save Class Definition"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
