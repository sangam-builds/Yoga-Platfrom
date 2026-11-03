import React from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, BarChart2, Sparkles, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Classes & Schedule Management | ZenFlow Admin",
  description: "View and manage yoga classes and scheduled sessions",
};

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  await requireAdmin();

  let classes: Array<{
    id: string;
    title: string;
    style: string;
    level: string;
    durationMin: number;
    capacity: number;
    isActive: boolean;
  }> = [];

  try {
    classes = await prisma.yogaClass.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        style: true,
        level: true,
        durationMin: true,
        capacity: true,
        isActive: true,
      },
    });
  } catch (err) {
    console.error("Failed to load yoga classes:", err);
  }

  // Fallback demo classes if none inserted yet in DB
  const displayClasses =
    classes.length > 0
      ? classes
      : [
          {
            id: "cls-hatha",
            title: "Hatha Yoga Foundations",
            style: "HATHA",
            level: "BEGINNER",
            durationMin: 45,
            capacity: 30,
            isActive: true,
          },
          {
            id: "cls-vinyasa",
            title: "Dynamic Vinyasa Flow",
            style: "VINYASA",
            level: "INTERMEDIATE",
            durationMin: 55,
            capacity: 25,
            isActive: true,
          },
          {
            id: "cls-power",
            title: "Power Yoga Core Vitality",
            style: "POWER",
            level: "ADVANCED",
            durationMin: 60,
            capacity: 20,
            isActive: true,
          },
          {
            id: "cls-meditation",
            title: "Pranayama & Sound Meditation",
            style: "MEDITATION",
            level: "ALL_LEVELS",
            durationMin: 25,
            capacity: 50,
            isActive: true,
          },
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233D32]">
            Curriculum & Class Management
          </h1>
          <p className="text-xs sm:text-sm text-[#292D2A]/70 font-light pt-1">
            Configure recurring class series, room capacities, and scheduling rules.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#233D32] text-white text-xs font-semibold opacity-80 cursor-not-allowed"
          title="Prisma migration pending"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Class Series</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayClasses.map((cls) => (
          <div
            key={cls.id}
            className="p-6 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-[#E9E2D0] text-[#233D32] font-semibold">
                  {cls.style}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#233D32] pt-2">
                  {cls.title}
                </h3>
              </div>

              <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs text-[#292D2A]/70 border-t border-[#E9E2D0]/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6B8F71]" />
                <span>{cls.durationMin} mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[#6B8F71]" />
                <span>{cls.level}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6B8F71]" />
                <span>Max {cls.capacity} Yogis</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

