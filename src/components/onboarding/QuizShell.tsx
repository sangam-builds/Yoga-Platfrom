"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Leaf, ArrowRight, ArrowLeft } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

interface QuizShellProps {
  currentStepIndex: number;
  totalSteps: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  canGoBack: boolean;
  canGoNext: boolean;
  isSubmitting?: boolean;
  nextButtonText?: string;
  onBack: () => void;
  onNext: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export function QuizShell({
  currentStepIndex,
  totalSteps,
  eyebrow,
  title,
  subtitle,
  children,
  canGoBack,
  canGoNext,
  isSubmitting = false,
  nextButtonText = "Continue",
  onBack,
  onNext,
  onSkip,
  showSkip = true,
}: QuizShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus management: move focus to step heading whenever step changes
  useEffect(() => {
    headingRef.current?.focus();
  }, [currentStepIndex]);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased font-figtree">
      {/* ========================================================= */}
      {/* LEFT COLUMN: Sanctuary Visual Photo Panel (Desktop)       */}
      {/* ========================================================= */}
      <div className="hidden lg:relative lg:flex lg:flex-col lg:justify-between lg:w-1/2 min-h-screen bg-[#2D3F33] overflow-hidden select-none p-10">
        <Image
          src="/images/yoga-login.jpg"
          alt="ZenFlow Sanctuary"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Ambient warmth & legibility gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/35 pointer-events-none" />

        {/* Top Header Overlay */}
        <div className="relative z-10 flex items-center justify-between w-full font-outfit">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-white/70 flex items-center justify-center backdrop-blur-2xs">
              <Leaf className="w-3.5 h-3.5 text-white stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-white uppercase drop-shadow-xs">
              ZENFLOW YOGA
            </span>
          </div>

          <span className="text-[10px] font-medium tracking-[0.25em] text-white/85 uppercase drop-shadow-xs">
            60 SECONDS TO PERSONALIZATION
          </span>
        </div>

        {/* Bottom Headline Overlay */}
        <div className="relative z-10 text-white max-w-md pb-4 font-outfit">
          <p className="text-xs font-bold tracking-[0.25em] text-white/90 uppercase mb-3 drop-shadow-xs">
            YOUR PRACTICE, YOUR PACE
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-white leading-[1.15] tracking-tight drop-shadow-sm">
            Every body is unique. Every practice is personal.
          </h2>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: Onboarding Quiz Form Panel                  */}
      {/* ========================================================= */}
      <main className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative bg-[var(--bg-canvas)]">
        {/* Top Navigation Bar */}
        <header className="w-full flex items-center justify-between mb-4">
          {/* Mobile Brand Leaf */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-outfit text-xs uppercase tracking-[0.2em] font-bold text-[var(--primary-sage)]">
              ZenFlow
            </span>
          </div>

          {/* Skip for now Link */}
          {showSkip && onSkip && (
            <div className="ml-auto text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
              <button
                type="button"
                onClick={onSkip}
                disabled={isSubmitting}
                className="font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline transition-colors cursor-pointer py-1 px-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)]"
              >
                Skip for now
              </button>
            </div>
          )}
        </header>

        {/* Centered Step Form Container */}
        <div className="w-full max-w-[540px] mx-auto my-auto py-4 sm:py-6">
          {/* Progress Bar */}
          <ProgressBar
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            eyebrow={eyebrow}
          />

          {/* Heading with Screen Reader Announcement */}
          <div className="mb-6">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-outfit text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight focus:outline-none"
            >
              {title}
            </h1>
            {subtitle && (
              <p className="font-figtree text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Step Form Body with Subtle Step Transition */}
          <section className="transition-opacity duration-200 ease-out motion-reduce:transition-none">
            {children}
          </section>
        </div>

        {/* Bottom Navigation Buttons (Sticky on mobile) */}
        <footer className="w-full max-w-[540px] mx-auto pt-6 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3 sticky bottom-0 bg-[var(--bg-canvas)] py-4 lg:relative lg:bg-transparent lg:py-0">
          {canGoBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm font-semibold hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
            className={`px-7 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)] ${
              canGoNext && !isSubmitting
                ? "bg-[var(--primary-sage)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] shadow-xs"
                : "bg-[var(--border-subtle)] text-[var(--text-muted)] opacity-60 cursor-not-allowed"
            }`}
          >
            <span>{isSubmitting ? "Saving..." : nextButtonText}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </footer>
      </main>
    </div>
  );
}
