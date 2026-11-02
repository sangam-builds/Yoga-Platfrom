import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, BarChart2, ArrowRight } from "lucide-react";

export function YogaClasses() {
  const classes = [
    {
      title: "Hatha Yoga",
      description:
        "Classic postures, sustained holds, and deliberate breath control to develop structural alignment, balance, and quiet focus.",
      level: "Beginner • All Levels",
      duration: "45 min",
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      tag: "Foundations",
    },
    {
      title: "Vinyasa Yoga",
      description:
        "Dynamic, synchronized sequences linking breath with fluid movement to awaken prana, build core heat, and cultivate flow state.",
      level: "Intermediate",
      duration: "55 min",
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
      tag: "Fluid Motion",
    },
    {
      title: "Power Yoga",
      description:
        "Vigorous, strength-focused flows designed to build functional muscular stamina, burn tension, and elevate your cardiovascular vitality.",
      level: "Advanced",
      duration: "60 min",
      image:
        "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=800&q=80",
      tag: "High Energy",
    },
    {
      title: "Meditation & Pranayama",
      description:
        "Ancient yogic breathing techniques paired with guided mindfulness to soothe the nervous system and quiet mental turbulence.",
      level: "All Levels",
      duration: "25 min",
      image:
        "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80",
      tag: "Mindfulness",
    },
    {
      title: "Beginner Yoga",
      description:
        "A safe, welcoming introduction to basic standing poses, gentle stretches, props usage, and calming yogic breathing essentials.",
      level: "Beginner",
      duration: "40 min",
      image:
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
      tag: "Gentle Start",
    },
    {
      title: "Relaxation & Stress Relief",
      description:
        "Restorative postures using bolsters and gentle floor stretches to deeply release spinal tension, anxiety, and fatigue.",
      level: "All Levels",
      duration: "50 min",
      image:
        "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=800&q=80",
      tag: "Restorative",
    },
  ];

  return (
    <section id="classes" className="py-20 md:py-28 bg-[#F4F7F4]/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
              Curated Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
              Explore Our Yoga Programs
            </h2>
            <p className="text-base sm:text-lg text-[#292D2A]/75 font-light">
              Designed by master practitioners to nurture physical resilience and mental
              clarity, tailored to where you are on your path today.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#233D32] hover:text-[#6B8F71] transition-colors self-start md:self-auto group pb-1 border-b border-[#233D32]/30 hover:border-[#6B8F71]"
          >
            <span>View All 50+ Classes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((cls, index) => (
            <div
              key={index}
              className="group rounded-3xl overflow-hidden bg-white border border-[#E9E2D0] hover:border-[#6B8F71]/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#E9E2D0]/30">
                <Image
                  src={cls.image}
                  alt={cls.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#233D32]/85 text-[#F8F7F2] backdrop-blur-md">
                    {cls.tag}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Meta Badges: duration & level */}
                  <div className="flex items-center gap-4 text-xs text-[#292D2A]/60">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#6B8F71]" />
                      <span>{cls.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-[#6B8F71]" />
                      <span>{cls.level}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif font-semibold text-[#233D32] group-hover:text-[#6B8F71] transition-colors">
                    {cls.title}
                  </h3>

                  <p className="text-sm text-[#292D2A]/70 leading-relaxed font-light line-clamp-3">
                    {cls.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E9E2D0]/60">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-[#233D32] bg-[#F8F7F2] hover:bg-[#6B8F71] hover:text-[#F8F7F2] transition-colors"
                  >
                    <span>Practice This Style</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-14 text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[#233D32] text-[#233D32] hover:bg-[#233D32] hover:text-[#F8F7F2] text-sm font-medium transition-colors"
          >
            <span>View Complete Schedule & All Classes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

