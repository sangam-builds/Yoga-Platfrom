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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Curriculum & Definitions
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            My Teaching Classes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Define recurring yoga styles, set practitioner capacity, props needed, and manage series.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class title or description..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] font-figtree"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 font-figtree cursor-pointer"
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
            <div key={i} className="h-48 bg-[var(--bg-elevated)] animate-pulse rounded-2xl border border-[var(--border-hairline)]" />
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-3xl p-12 border border-[var(--border-subtle)] text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">No Classes Found</h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-figtree">
              You haven't defined any yoga classes matching your search. Create a new series to start offering scheduled sessions.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 cursor-pointer shadow-xs"
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
              className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] p-5 shadow-2xs flex flex-col justify-between hover:border-[var(--primary-sage)]/50 transition-all space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-figtree uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] font-bold">
                    {cls.style} • {cls.level.replace("_", " ")}
                  </span>
                  <span className={`text-[10px] font-figtree px-2.5 py-0.5 rounded-full font-semibold ${
                    cls.isActive ? "bg-[var(--sage-tint)] text-[var(--primary-sage)]" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)]"
                  }`}>
                    {cls.isActive ? "Active Series" : "Inactive"}
                  </span>
                </div>

                <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">
                  {cls.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed font-figtree">
                  {cls.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[var(--border-hairline)]">
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] font-figtree">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                    <span>{cls.durationMin} minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                    <span>Cap: {cls.capacity} students</span>
                  </div>
                </div>

                {cls.recurrenceRule && (
                  <p className="text-[10px] font-figtree text-[var(--text-subtle)] truncate">
                    Recurrence: {cls.recurrenceRule}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[var(--text-muted)] font-figtree">
                    <strong className="text-[var(--text-primary)]">{cls.totalSessionsCount}</strong> total sessions
                  </span>
                  <Link href={`/instructor/schedule?class=${cls.id}`}>
                    <Button size="sm" variant="outline" className="text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
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
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-[var(--border-subtle)] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">
                  New Yoga Class Definition
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createClassMutation.mutate();
              }}
              className="space-y-4 text-xs font-figtree"
            >
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Awakening Vinyasa"
                  className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe flow rhythm, theme, breathing focus, and target benefits..."
                  className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Style *
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer outline-none"
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
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer outline-none"
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
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    Practitioner Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Props Needed (comma separated)
                </label>
                <input
                  type="text"
                  value={propsNeeded}
                  onChange={(e) => setPropsNeeded(e.target.value)}
                  placeholder="Yoga mat, 2 blocks, strap"
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Key Benefits (comma separated)
                </label>
                <input
                  type="text"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Improved posture, spine alignment, mental clarity"
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Recurrence Rule (RFC 5545 RRULE)
                </label>
                <input
                  type="text"
                  value={recurrenceRule}
                  onChange={(e) => setRecurrenceRule(e.target.value)}
                  placeholder="FREQ=WEEKLY;BYDAY=MO,WE,FR"
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-xl outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--border-hairline)]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createClassMutation.isPending}
                  className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] cursor-pointer shadow-xs"
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
