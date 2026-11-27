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
import { AlertCircle, RefreshCw } from "lucide-react";

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
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-canvas)]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[var(--primary-sage)] animate-spin mx-auto" />
          <p className="font-outfit text-sm text-[var(--text-muted)] tracking-wide">
            Preparing your practice profile...
          </p>
        </div>
      </div>
    );
  }

  return (
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

      {/* Dynamic Step Component */}
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
    </QuizShell>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-canvas)]">
          <RefreshCw className="w-8 h-8 text-[var(--primary-sage)] animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
