import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] lg:w-[700px] h-[340px] sm:h-[500px] bg-[#E9E2D0]/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-60 sm:w-80 h-60 sm:h-80 bg-[#6B8F71]/10 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9E2D0]/60 border border-[#6B8F71]/20 text-[#233D32] text-xs sm:text-sm font-medium tracking-wide shadow-xs max-w-full">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B8F71] shrink-0" />
              <span className="truncate">Find Your Balance • Transform Your Life</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#233D32] tracking-tight leading-[1.18] sm:leading-[1.15]">
              Discover Your <span className="italic font-normal text-[#6B8F71]">Inner Peace</span>{" "}
              Through Yoga
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-xl text-[#292D2A]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Build a healthier, stronger, and more mindful lifestyle with expert-led yoga
              classes designed for every level.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-[#233D32] hover:bg-[#6B8F71] text-[#F8F7F2] text-sm sm:text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#classes"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 rounded-full border border-[#233D32]/20 hover:border-[#233D32] bg-[#F8F7F2]/60 hover:bg-[#F8F7F2] text-[#233D32] text-sm sm:text-base font-medium transition-all duration-200"
              >
                Explore Classes
              </a>
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 border-t border-[#E9E2D0]/80 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3.5 sm:gap-6 text-xs sm:text-sm text-[#292D2A]/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6B8F71] shrink-0" />
                <span>100+ Live & On-Demand Classes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6B8F71] shrink-0" />
                <span>Certified Global Instructors</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#233D32] font-medium">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span>4.9/5 from 15k+ Yogis</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual / Image */}
          <div className="lg:col-span-5 relative flex justify-center pt-4 sm:pt-0">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-2 sm:-inset-3 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-dashed border-[#6B8F71]/30 -rotate-1 sm:-rotate-2 -z-10" />

              {/* Main Image Container */}
              <div className="relative aspect-[4/5] rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-2xl bg-[#E9E2D0]/30 border border-[#E9E2D0]">
                <Image
                  src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80"
                  alt="A woman gracefully practicing yoga meditation in a tranquil sunlit studio"
                  fill
                  priority
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                />
                {/* Subtle soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#233D32]/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge 1: Daily Live Practice (Mobile-safe positioning) */}
              <div className="absolute -bottom-4 left-2 right-2 sm:right-auto sm:-bottom-5 sm:-left-4 bg-[#F8F7F2]/95 backdrop-blur-md border border-[#E9E2D0] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6B8F71]/15 flex items-center justify-center text-[#6B8F71] shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#292D2A]/60 uppercase tracking-wider font-semibold">
                    Daily Schedule
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[#233D32]">
                    Morning & Evening Live
                  </p>
                </div>
              </div>

              {/* Floating Badge 2: Certified Teachers */}
              <div className="hidden sm:flex absolute -top-5 -right-4 bg-[#233D32] text-[#F8F7F2] p-3.5 rounded-2xl shadow-xl items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium tracking-wide">
                  500h E-RYT Certified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

