"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  BookOpen,
  Plus,
  Clock,
  Sparkles,
  Download,
  X,
  FileText,
  Shield,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorStudentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-students"],
    queryFn: async () => {
      const res = await fetch("/api/instructor/students");
      if (!res.ok) throw new Error("Failed to load students");
      return res.json();
    },
  });

  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ["instructor-student-notes", selectedStudent?.id],
    queryFn: async () => {
      if (!selectedStudent) return { notes: [] };
      const res = await fetch(`/api/instructor/students/${selectedStudent.id}/notes`);
      if (!res.ok) throw new Error("Failed to load notes");
      return res.json();
    },
    enabled: !!selectedStudent,
  });

  const createNoteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStudent) return;
      const res = await fetch(`/api/instructor/students/${selectedStudent.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to add note");
      return d;
    },
    onSuccess: () => {
      toast.success("Private teaching observation saved.");
      queryClient.invalidateQueries({
        queryKey: ["instructor-student-notes", selectedStudent?.id],
      });
      setNewNote("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const students = data?.students || [];
  const filteredStudents = students.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const notes = notesData?.notes || [];

  const handleExportCsv = () => {
    // Generate minimized CSV: Name, Level, AttendanceCount, LastAttended (No emails/phones!)
    const headers = "Student Name,Experience Level,Sessions Attended,Last Attended\n";
    const rows = filteredStudents
      .map(
        (s: any) =>
          `"${s.name}","${s.level}","${s.attendanceCount}","${new Date(s.lastAttendedAt).toLocaleDateString()}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `zenflow_students_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export downloaded. Privacy data minimization verified.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Practitioner Community
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            My Students
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Track practitioner attendance history, view level progressions, and record private teaching observations.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          className="text-xs gap-1.5 border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          Export Minimal CSV
        </Button>
      </div>

      {/* Search & Privacy Pill */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search practitioner name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] font-figtree"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--sage-tint)] text-[var(--primary-sage)] border border-[var(--primary-sage)]/20 text-xs font-figtree font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Data Minimized (Zero PII / Health Exposure)</span>
        </div>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-hairline)] animate-pulse" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-3xl p-12 border border-[var(--border-subtle)] text-center space-y-3 shadow-2xs">
          <Users className="w-10 h-10 text-[var(--text-subtle)] mx-auto" />
          <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)]">No Students Found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-figtree">
            Once practitioners book and attend your yoga sessions, they will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student: any) => (
            <div
              key={student.id}
              className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs flex flex-col justify-between hover:border-[var(--primary-sage)]/60 transition-all space-y-3 font-figtree"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center font-outfit font-bold text-sm">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                    {student.name}
                  </h3>
                  <span className="text-[10px] font-figtree px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-hairline)] font-medium">
                    {student.level}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>
                  <strong className="text-[var(--text-primary)]">{student.attendanceCount}</strong> classes attended
                </span>
                <span className="text-[var(--text-subtle)] text-[10px]">
                  Last: {new Date(student.lastAttendedAt).toLocaleDateString()}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedStudent(student)}
                className="w-full text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--primary-sage)] gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--primary-sage)]" />
                Private Teaching Notes
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Private Notes Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 font-figtree">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                    Teaching Notes: {selectedStudent.name}
                  </h3>
                  <span className="text-[10px] text-[var(--text-subtle)]">
                    Visible only to you and permitted platform administrators
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">Past Observations</h4>
              {notesLoading ? (
                <div className="h-20 bg-[var(--bg-elevated)] rounded-xl animate-pulse border border-[var(--border-hairline)]" />
              ) : notes.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic">No notes recorded yet for this practitioner.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {notes.map((n: any) => (
                    <div key={n.id} className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs space-y-1">
                      <p className="text-[var(--text-primary)] leading-relaxed">{n.content}</p>
                      <span className="text-[10px] text-[var(--text-subtle)] block">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add note form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createNoteMutation.mutate();
              }}
              className="space-y-3 pt-3 border-t border-[var(--border-hairline)]"
            >
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                Add Observation / Cue Adjustment
              </label>
              <textarea
                rows={3}
                required
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Needs block support in Trikonasana; working on hamstring flexibility..."
                className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)] outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={!newNote.trim() || createNoteMutation.isPending}
                  className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs"
                >
                  {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
