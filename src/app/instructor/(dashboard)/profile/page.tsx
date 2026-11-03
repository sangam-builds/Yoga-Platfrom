"use client";

import React, { useState } from "react";
import { UserCheck, Camera, Video, Award, Globe, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorProfilePage() {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("Aarav Mehta");
  const [bio, setBio] = useState(
    "Dedicated Vinyasa and Hatha yoga master with 10+ years of practice in Rishikesh and Mysore. Focused on somatic awareness, breathwork, and alignment."
  );
  const [yearsExperience, setYearsExperience] = useState(10);
  const [certifications, setCertifications] = useState("RYT-500, Yoga Alliance International, Prenatal Yoga Certified");
  const [specialties, setSpecialties] = useState("Vinyasa Flow, Hatha Yoga, Pranayama, Meditation");
  const [introVideo, setIntroVideo] = useState("https://youtube.com/watch?v=sample-zenflow-intro");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Public teacher profile updated successfully.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Public Directory Presentation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Teacher Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Showcase your teaching lineage, yoga certifications, and introductory video to prospective students.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("Public preview opened in new tab.")}
          className="text-xs border-[#E9E2D0] bg-white text-stone-700 self-start sm:self-auto"
        >
          Preview Public Page
        </Button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E9E2D0] shadow-xs max-w-2xl">
        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#6B8F71] text-white flex items-center justify-center font-bold text-xl shadow-md relative group">
              {displayName.charAt(0)}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-bold text-stone-800 text-sm">Instructor Headshot</p>
              <p className="text-stone-500 text-[11px]">PNG, JPG up to 5MB. Verified by operations.</p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Teaching Bio *</label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Years of Teaching</label>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Primary Specialties</label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Verified Certifications (comma separated)
            </label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl text-xs"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Changes to certifications may require administrative re-verification before displaying the Verified badge.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Introductory Video Link
            </label>
            <input
              type="url"
              value={introVideo}
              onChange={(e) => setIntroVideo(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E9E2D0] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="pt-3 border-t border-[#E9E2D0] flex justify-end">
            <Button type="submit" className="bg-[#6B8F71] hover:bg-[#58775D] text-white text-xs">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
