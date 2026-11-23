import React from "react";
import {
  Video,
  CreditCard,
  GraduationCap,
  TrendingUp,
  PlayCircle,
  Compass,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Video,
      title: "Live Yoga Classes",
      description:
        "Join interactive live sessions with expert instructors. Real-time feedback, guided alignment, and community energy from your home.",
    },
    {
      icon: CreditCard,
      title: "Flexible Memberships",
      description:
        "Choose plans that fit your lifestyle and budget. Seamless access with no hidden fees or strict lock-in commitments.",
    },
    {
      icon: GraduationCap,
      title: "Expert Instructors",
      description:
        "Learn from experienced and certified yoga professionals dedicated to authentic anatomy, breathwork, and alignment.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Track your consistency, attendance, and wellness journey with mindful streaks and personal practice insights.",
    },
    {
      icon: PlayCircle,
      title: "On-Demand Sessions",
      description:
        "Practice anytime with recorded yoga classes. Filter by style, duration, teacher, or target muscle group whenever you need.",
    },
    {
      icon: Compass,
      title: "Personalized Experience",
      description:
        "Discover classes based on your goals and experience—whether you seek deep flexibility, mental calm, or athletic strength.",
    },
  ];

  return (
    <section className="py-14 sm:py-20 md:py-28 bg-[#F8F7F2] relative border-t border-[#E9E2D0]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16 md:mb-20">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
            Holistic Platform Features
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
            Everything You Need for Your Wellness Journey
          </h2>
          <p className="text-sm sm:text-lg text-[#292D2A]/75 font-light leading-relaxed">
            From your very first stretch to advanced mindful asanas, ZenFlow provides
            the space and tools to cultivate enduring inner and outer harmony.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/70 hover:bg-white border border-[#E9E2D0] hover:border-[#6B8F71]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E9E2D0]/50 group-hover:bg-[#6B8F71]/15 text-[#233D32] group-hover:text-[#6B8F71] flex items-center justify-center transition-colors mb-4 sm:mb-6">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#233D32] mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#292D2A]/70 leading-relaxed font-light">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[#E9E2D0]/40 flex items-center gap-2 text-xs font-medium text-[#6B8F71] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

