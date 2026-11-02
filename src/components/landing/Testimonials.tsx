import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Meera Krishnan",
      role: "Member for 14 Months • Bangalore",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      content:
        "ZenFlow completely transformed my desk posture and chronic lower back stiffness. The live alignment cues from Aria and Marcus feel just as personal and attentive as an in-person private studio.",
    },
    {
      name: "Dr. Julian Harris",
      role: "Practitioner for 8 Months • London",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      content:
        "As a surgeon working unpredictable 12-hour shifts, having the freedom to join a 30-minute calming breathwork flow before dawn or wind down at midnight has been instrumental to my mental balance.",
    },
    {
      name: "Ananya Deshmukh",
      role: "Member for 2 Years • Mumbai",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      content:
        "The consistency tracking and streak badges kept me committed when my motivation wavered. ZenFlow isn't just another video library—it’s an encouraging, deeply grounded sanctuary.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F4F7F4]/40 relative border-t border-[#E9E2D0]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 md:mb-20">
          <span className="text-xs sm:text-sm uppercase tracking-widest text-[#6B8F71] font-semibold">
            Member Reflections
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#233D32] tracking-tight">
            What Our Members Say
          </h2>
          <p className="text-base sm:text-lg text-[#292D2A]/75 font-light leading-relaxed">
            Real stories of quiet transformation, renewed vitality, and mindful grounding
            from practitioners across the globe.
          </p>
        </div>

        {/* 3 Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-white border border-[#E9E2D0] hover:border-[#6B8F71]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
            >
              <div className="space-y-4">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-[#6B8F71]/30 rotate-180" />

                {/* Stars */}
                <div className="flex text-amber-500 gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <p className="text-sm text-[#292D2A]/80 font-light leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-6 mt-6 border-t border-[#E9E2D0]/60 flex items-center gap-3.5">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#6B8F71]/30 bg-[#E9E2D0]/40 shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#233D32]">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-[#292D2A]/60 font-light">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

