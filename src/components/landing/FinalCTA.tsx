import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#233D32] text-[#F8F7F2] relative overflow-hidden">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6B8F71]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E9E2D0]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E9E2D0] text-xs font-medium tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#6B8F71]" />
          <span>Begin With A 7-Day Free Trial</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
          Your Wellness Journey Starts Today
        </h2>

        <p className="text-base sm:text-xl text-[#F8F7F2]/80 font-light max-w-2xl mx-auto leading-relaxed">
          Take the first step toward a healthier body and a calmer mind. Join
          thousands of mindful practitioners practicing daily with ZenFlow.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-[#6B8F71] hover:bg-[#57785D] text-white text-base font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#classes"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/30 hover:border-white text-white text-base font-medium transition-colors"
          >
            Explore Programs
          </a>
        </div>
      </div>
    </section>
  );
}

