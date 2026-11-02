import React from "react";
import Image from "next/image";
import { Heart, Sun, ShieldCheck } from "lucide-react";

export function AboutUs() {
  const pillars = [
    {
      icon: Sun,
      title: "Ancient Wisdom, Modern Rhythm",
      description:
        "We distill centuries-old yogic traditions into accessible daily rituals that fit seamlessly into busy modern life.",
    },
    {
      icon: Heart,
      title: "Compassionate Inclusivity",
      description:
        "Every body, age, and background has a rightful place on the mat. We honor individuality over rigid perfection.",
    },
    {
      icon: ShieldCheck,
      title: "Anatomical Integrity",
      description:
        "Every session is grounded in safe functional biomechanics to protect your joints, spine, and lifelong health.",
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-[#F8F7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border border-[#E9E2D0]">
              <Image
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
                alt="A tranquil yoga gathering in natural light"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#233D32]/70 via-transparent to-transparent flex items-end p-8">
                <blockquote className="text-white text-sm italic font-serif leading-relaxed">
                  &ldquo;Yoga is not about touching your toes, it is what you learn on the way down.&rdquo;
                </blockquote>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Philosophy */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
                About ZenFlow
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
                A Sanctuary for Calm, Strength, and Lifelong Vitality
              </h2>
              <p className="text-base sm:text-lg text-[#292D2A]/80 font-light leading-relaxed pt-2">
                ZenFlow was founded on a simple conviction: that genuine mindfulness and
                vitality shouldn&apos;t require escaping to an ashram. By combining live
                teacher-led classes with intelligent tracking and a compassionate
                global community, we bring the sanctuary directly to your home.
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="space-y-6 pt-2">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#E9E2D0]/60 text-[#233D32] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-semibold text-[#233D32]">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-[#292D2A]/70 font-light leading-relaxed pt-0.5">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

