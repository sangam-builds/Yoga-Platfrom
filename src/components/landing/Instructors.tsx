import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";

export function Instructors() {
  const instructors = [
    {
      name: "Aria Sharma",
      specialization: "Hatha & Ashtanga Yoga",
      bio: "Trained in Rishikesh with over 14 years of teaching experience. Aria emphasizes anatomical safety, alignment, and mindful stillness.",
      credentials: "500h E-RYT • Rishikesh Yogpeeth",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Marcus Vance",
      specialization: "Dynamic Vinyasa & Prana Flow",
      bio: "Former movement artist who integrates rhythmic breathing with playful, energizing sequences that elevate both stamina and mental focus.",
      credentials: "E-RYT 500 • Certified Kinesiologist",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Priya Nair",
      specialization: "Yin Yoga, Breathwork & Sound Healing",
      bio: "Specializing in the parasympathetic nervous system, Priya guides transformative restorative sessions that heal burnout and fatigue.",
      credentials: "MA Yoga Therapy • Sound Practitioner",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "David Chen",
      specialization: "Power Yoga & Posture Alignment",
      bio: "Focuses on building functional core strength, injury prevention, and building confidence in advanced arm balances and inversions.",
      credentials: "YACEP Provider • 10+ Yrs Coaching",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section id="instructors" className="py-20 md:py-28 bg-[#F4F7F4]/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 md:mb-20">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
            Certified Masters & Guides
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
            Meet Our Expert Instructors
          </h2>
          <p className="text-base sm:text-lg text-[#292D2A]/75 font-light leading-relaxed">
            Our teachers hold the highest international accreditations and share a deep
            commitment to guiding you with warmth, patience, and precise knowledge.
          </p>
        </div>

        {/* 4 Instructor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor, index) => (
            <div
              key={index}
              className="group rounded-3xl overflow-hidden bg-white border border-[#E9E2D0] hover:border-[#6B8F71]/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#E9E2D0]/30">
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#233D32]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                  <span className="text-xs text-[#F8F7F2] font-medium flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#E9E2D0]" />
                    {instructor.credentials}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-serif font-bold text-[#233D32]">
                    {instructor.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#6B8F71] tracking-wide uppercase">
                    {instructor.specialization}
                  </p>
                  <p className="text-xs text-[#292D2A]/70 leading-relaxed font-light pt-1">
                    {instructor.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E9E2D0]/60">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#233D32] hover:text-[#6B8F71] transition-colors"
                  >
                    <span>Practice with {instructor.name.split(" ")[0]}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

