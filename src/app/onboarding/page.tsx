"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/hooks/useOnboarding";
import { QuizShell } from "@/components/onboarding/QuizShell";
import { StepExperience } from "@/components/onboarding/steps/StepExperience";
import { StepGoals } from "@/components/onboarding/steps/StepGoals";
import { StepLimitations } from "@/components/onboarding/steps/StepLimitations";
import { StepStyles } from "@/components/onboarding/steps/StepStyles";
import { StepSchedule } from "@/components/onboarding/steps/StepSchedule";
import { StepWeeklyGoal } from "@/components/onboarding/steps/StepWeeklyGoal";
import { StepLocale } from "@/components/onboarding/steps/StepLocale";
import { SummaryStep } from "@/components/onboarding/steps/SummaryStep";
import { AlertCircle, Leaf, Sparkles } from "lucide-react";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");

  const {
    isLoading,
    isSaving,
    errorMessage,
    currentStep,
    currentStepIndex,
    totalSteps,
    currentStepConfig,
    answers,
    setAnswers,
    canGoBack,
    canGoNext,
    isLastStep,
    goBack,
    goNext,
    skipOnboarding,
  } = useOnboarding(stepParam);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-canvas)] p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] mx-auto flex items-center justify-center shadow-xs animate-zen-breathe">
            <Leaf className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-outfit text-base font-semibold text-[var(--text-primary)]">
              Preparing Your Practice
            </h3>
            <p className="font-figtree text-xs text-[var(--text-muted)] leading-relaxed">
              Loading your personalized sanctuary profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Soothing Final Provisioning Overlay when completing trial setup */}
      {isSaving && isLastStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-canvas)]/85 backdrop-blur-xs transition-opacity duration-300 p-6">
          <div className="text-center space-y-5 max-w-md w-full p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-lg animate-step-enter">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center shadow-xs animate-zen-breathe">
                <Sparkles className="w-6 h-6 stroke-[1.8]" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                Personalizing Your Sanctuary
              </h3>
              <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Activating your 7-day free trial, depositing 5 class credits, and curating your beginner-friendly recommendations...
              </p>
            </div>

            <div className="w-48 h-1 rounded-full bg-[var(--border-hairline)] mx-auto overflow-hidden">
              <div className="h-full rounded-full bg-[var(--primary-sage)] animate-zen-shimmer w-full" />
            </div>
          </div>
        </div>
      )}

      <QuizShell
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        eyebrow={currentStepConfig?.eyebrow}
        title={currentStepConfig?.title || "Practice Personalization"}
        subtitle={currentStepConfig?.subtitle}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
        isSubmitting={isSaving}
        nextButtonText={isLastStep ? "Finish & Start Free Trial" : "Continue"}
        onBack={goBack}
        onNext={goNext}
        onSkip={skipOnboarding}
        showSkip={!isLastStep}
      >
        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 flex items-start gap-2.5 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Dynamic Step Component with Smooth Step Transition */}
        <div key={currentStep} className="animate-step-enter">
          {currentStep === "experience" && (
            <StepExperience
              value={answers.experienceLevel}
              onChange={(val) => setAnswers((prev) => ({ ...prev, experienceLevel: val }))}
            />
          )}

          {currentStep === "goals" && (
            <StepGoals
              values={answers.goals}
              onChange={(goals) => setAnswers((prev) => ({ ...prev, goals }))}
            />
          )}

          {currentStep === "limitations" && (
            <StepLimitations
              limitations={answers.limitations}
              notes={answers.notes}
              pregnancy={answers.pregnancy}
              onChange={(limData) =>
                setAnswers((prev) => ({
                  ...prev,
                  limitations: limData.limitations,
                  notes: limData.notes,
                  pregnancy: limData.pregnancy,
                }))
              }
            />
          )}

          {currentStep === "styles" && (
            <StepStyles
              values={answers.preferredStyles}
              onChange={(styles) => setAnswers((prev) => ({ ...prev, preferredStyles: styles }))}
            />
          )}

          {currentStep === "schedule" && (
            <StepSchedule
              times={answers.preferredTimes}
              days={answers.preferredDays}
              onChange={(sched) =>
                setAnswers((prev) => ({
                  ...prev,
                  preferredTimes: sched.times,
                  preferredDays: sched.days,
                }))
              }
            />
          )}

          {currentStep === "weekly_goal" && (
            <StepWeeklyGoal
              value={answers.weeklyGoal}
              onChange={(val) => setAnswers((prev) => ({ ...prev, weeklyGoal: val }))}
            />
          )}

          {currentStep === "locale" && (
            <StepLocale
              timezone={answers.timezone}
              locale={answers.locale}
              onChange={(loc) =>
                setAnswers((prev) => ({
                  ...prev,
                  timezone: loc.timezone,
                  locale: loc.locale,
                }))
              }
            />
          )}

          {currentStep === "summary" && (
            <SummaryStep
              answers={answers}
              onConsentChange={(consent) =>
                setAnswers((prev) => ({
                  ...prev,
                  marketingOptIn: consent.marketingOptIn,
                  whatsappOptIn: consent.whatsappOptIn,
                }))
              }
            />
          )}
        </div>
      </QuizShell>
    </>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-canvas)]">
          <div className="w-12 h-12 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center animate-zen-breathe">
            <Leaf className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
