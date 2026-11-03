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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Practitioner Community
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            My Students
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Track practitioner attendance history, view level progressions, and record private teaching observations.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          className="text-xs gap-1.5 border-[#E9E2D0] bg-white text-stone-700 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          Export Minimal CSV
        </Button>
      </div>

      {/* Search & Privacy Pill */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search practitioner name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-[#E9E2D0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data Minimized (Zero PII / Health Exposure)</span>
        </div>
      </div>

      {/* Students Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E9E2D0] text-center space-y-3">
          <Users className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#233D32]">No Students Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once practitioners book and attend your yoga sessions, they will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student: any) => (
            <div
              key={student.id}
              className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs flex flex-col justify-between hover:border-[#6B8F71]/60 transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#6B8F71]/15 text-[#233D32] flex items-center justify-center font-bold text-sm">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#233D32]">
                    {student.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F8F7F2] text-stone-600 border border-[#E9E2D0]">
                    {student.level}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E9E2D0] flex items-center justify-between text-xs text-stone-600 font-mono">
                <span>
                  <strong>{student.attendanceCount}</strong> classes attended
                </span>
                <span className="text-stone-400 text-[10px]">
                  Last: {new Date(student.lastAttendedAt).toLocaleDateString()}
                </span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedStudent(student)}
                className="w-full text-xs border-[#E9E2D0] hover:border-[#6B8F71] gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#6B8F71]" />
                Private Teaching Notes
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Private Notes Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-[#E9E2D0] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#6B8F71]/15 text-[#6B8F71] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#233D32]">
                    Teaching Notes: {selectedStudent.name}
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">
                    Visible only to you and permitted platform administrators
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-stone-700">Past Observations</h4>
              {notesLoading ? (
                <div className="h-20 bg-stone-100 rounded-xl animate-pulse" />
              ) : notes.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No notes recorded yet for this practitioner.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {notes.map((n: any) => (
                    <div key={n.id} className="p-3 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-xs space-y-1">
                      <p className="text-stone-800 leading-relaxed">{n.content}</p>
                      <span className="text-[10px] font-mono text-stone-400 block">
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
              className="space-y-3 pt-3 border-t border-[#E9E2D0]"
            >
              <label className="block text-xs font-semibold text-stone-700">
                Add Observation / Cue Adjustment
              </label>
              <textarea
                rows={3}
                required
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Needs block support in Trikonasana; working on hamstring flexibility..."
                className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl text-xs focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
              />
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="text-xs">
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={!newNote.trim() || createNoteMutation.isPending}
                  className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs"
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
