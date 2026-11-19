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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Public Directory Presentation
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Teacher Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Showcase your teaching lineage, yoga certifications, and introductory video to prospective students.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("Public preview opened in new tab.")}
          className="text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] self-start sm:self-auto cursor-pointer"
        >
          Preview Public Page
        </Button>
      </div>

      <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-subtle)] shadow-2xs max-w-2xl font-figtree">
        <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary-sage)] text-[var(--on-primary)] flex items-center justify-center font-outfit font-bold text-xl shadow-xs relative group">
              {displayName.charAt(0)}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-outfit font-bold text-[var(--text-primary)] text-sm">Instructor Headshot</p>
              <p className="text-[var(--text-muted)] text-[11px]">PNG, JPG up to 5MB. Verified by operations.</p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Display Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">Teaching Bio *</label>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--primary-sage)]/30 focus:border-[var(--primary-sage)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Years of Teaching</label>
              <input
                type="number"
                min={0}
                max={50}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Primary Specialties</label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Verified Certifications (comma separated)
            </label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
            />
            <p className="text-[10px] text-[var(--text-subtle)] mt-1">
              Changes to certifications may require administrative re-verification before displaying the Verified badge.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Introductory Video Link
            </label>
            <input
              type="url"
              value={introVideo}
              onChange={(e) => setIntroVideo(e.target.value)}
              className="w-full px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none font-mono"
            />
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)] flex justify-end">
            <Button type="submit" className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
