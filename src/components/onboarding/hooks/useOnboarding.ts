"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepId, ORDERED_STEPS, ONBOARDING_STEPS } from "@/modules/onboarding/onboarding.config";

export interface OnboardingAnswers {
  experienceLevel?: string | null;
  goals: string[];
  limitations: string[];
  notes?: string;
  pregnancy?: boolean;
  preferredStyles: string[];
  preferredTimes: string[];
  preferredDays: number[];
  weeklyGoal: number;
  timezone: string;
  locale: "en" | "hi" | "pa";
  marketingOptIn: boolean;
  whatsappOptIn: boolean;
}

export function useOnboarding(initialStepParam?: string | null) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active step in UI
  const [currentStep, setCurrentStep] = useState<StepId>("experience");

  // Server version tracking for optimistic concurrency
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  // Form answers state
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    experienceLevel: null,
    goals: [],
    limitations: [],
    notes: "",
    pregnancy: false,
    preferredStyles: [],
    preferredTimes: [],
    preferredDays: [],
    weeklyGoal: 3,
    timezone: "Asia/Kolkata",
    locale: "en",
    marketingOptIn: false,
    whatsappOptIn: false,
  });

  const hasFetchedRef = useRef(false);

  // Fetch initial progress and saved answers ONCE on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    let isMounted = true;

    async function fetchOnboarding() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/me/onboarding");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?next=/onboarding");
            return;
          }
          throw new Error("Failed to load onboarding");
        }

        const data = await res.json();
        if (!isMounted) return;

        setUpdatedAt(data.progress?.updatedAt || null);

        // Preload answers from server
        if (data.answers) {
          setAnswers((prev) => ({
            ...prev,
            experienceLevel: data.answers.experienceLevel ?? prev.experienceLevel,
            goals: data.answers.goals ?? prev.goals,
            preferredStyles: data.answers.preferredStyles ?? prev.preferredStyles,
            preferredTimes: data.answers.preferredTimes ?? prev.preferredTimes,
            preferredDays: data.answers.preferredDays ?? prev.preferredDays,
            weeklyGoal: data.answers.weeklyGoal ?? prev.weeklyGoal,
            timezone: data.answers.timezone || prev.timezone,
            locale: data.answers.locale || prev.locale,
            marketingOptIn: data.answers.marketingOptIn ?? prev.marketingOptIn,
            whatsappOptIn: data.answers.whatsappOptIn ?? prev.whatsappOptIn,
          }));
        }

        // URL parameter takes precedence on initial mount, then saved server step, then experience
        if (initialStepParam && ORDERED_STEPS.includes(initialStepParam as StepId)) {
          setCurrentStep(initialStepParam as StepId);
        } else if (data.progress?.currentStep && ORDERED_STEPS.includes(data.progress.currentStep as StepId)) {
          setCurrentStep(data.progress.currentStep as StepId);
        }
      } catch (err: any) {
        if (isMounted) setErrorMessage(err.message || "Could not load onboarding.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOnboarding();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Sync step changes to URL
  const updateUrlStep = useCallback((step: StepId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", step);
    window.history.replaceState(null, "", url.toString());
  }, []);

  // Save current step to backend and advance
  const saveCurrentStepAndAdvance = useCallback(
    async (nextStepId: StepId) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        // Build step-specific payload
        let payload: any = {};
        if (currentStep === "experience") {
          payload = { experienceLevel: answers.experienceLevel };
        } else if (currentStep === "goals") {
          payload = { goals: answers.goals };
        } else if (currentStep === "limitations") {
          payload = {
            limitations: answers.limitations,
            notes: answers.notes,
            pregnancy: answers.pregnancy,
          };
        } else if (currentStep === "styles") {
          payload = { preferredStyles: answers.preferredStyles };
        } else if (currentStep === "schedule") {
          payload = {
            preferredTimes: answers.preferredTimes,
            preferredDays: answers.preferredDays,
          };
        } else if (currentStep === "weekly_goal") {
          payload = { weeklyGoal: answers.weeklyGoal };
        } else if (currentStep === "locale") {
          payload = { timezone: answers.timezone, locale: answers.locale };
        } else if (currentStep === "summary") {
          payload = {
            marketingOptIn: answers.marketingOptIn,
            whatsappOptIn: answers.whatsappOptIn,
          };
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (updatedAt) {
          headers["if-match"] = updatedAt;
        }

        const res = await fetch(`/api/me/onboarding/steps/${currentStep}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to save step.");
        }

        const resData = await res.json();
        if (resData.updatedAt) {
          setUpdatedAt(resData.updatedAt);
        }

        setCurrentStep(nextStepId);
        updateUrlStep(nextStepId);
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to save step.");
      } finally {
        setIsSaving(false);
      }
    },
    [currentStep, answers, updatedAt, updateUrlStep]
  );

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      const res = await fetch("/api/me/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceLevel: answers.experienceLevel,
          goals: answers.goals,
          preferredStyles: answers.preferredStyles,
          preferredTimes: answers.preferredTimes,
          preferredDays: answers.preferredDays,
          weeklyGoal: answers.weeklyGoal,
          timezone: answers.timezone,
          locale: answers.locale,
          limitations: answers.limitations,
          notes: answers.notes,
          pregnancy: answers.pregnancy,
          marketingOptIn: answers.marketingOptIn,
          whatsappOptIn: answers.whatsappOptIn,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to complete onboarding.");
      }

      // Smoothly navigate to first booking screen
      router.push("/welcome");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to finish onboarding.");
      setIsSaving(false);
    }
  }, [answers, router]);

  // Skip onboarding
  const skipOnboarding = useCallback(async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      const res = await fetch("/api/me/onboarding/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketingOptIn: answers.marketingOptIn,
          whatsappOptIn: answers.whatsappOptIn,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to skip onboarding.");
      }

      router.push("/welcome");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to skip onboarding.");
      setIsSaving(false);
    }
  }, [answers, router]);

  // Navigation helpers
  const currentStepIndex = ORDERED_STEPS.indexOf(currentStep);
  const totalSteps = ORDERED_STEPS.length - 1; // excluding summary as step 8
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStep === "summary";

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      const prev = ORDERED_STEPS[currentStepIndex - 1];
      setCurrentStep(prev);
      updateUrlStep(prev);
    }
  }, [currentStepIndex, updateUrlStep]);

  const goNext = useCallback(() => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      const next = ORDERED_STEPS[currentStepIndex + 1];
      saveCurrentStepAndAdvance(next);
    }
  }, [isLastStep, currentStepIndex, completeOnboarding, saveCurrentStepAndAdvance]);

  // Check if Next is allowed on current step
  const canGoNext = useCallback((): boolean => {
    if (currentStep === "experience") {
      return Boolean(answers.experienceLevel);
    }
    if (currentStep === "goals") {
      return answers.goals.length > 0;
    }
    if (currentStep === "styles") {
      return answers.preferredStyles.length > 0;
    }
    return true; // other steps optional or prefilled
  }, [currentStep, answers]);

  return {
    isLoading,
    isSaving,
    errorMessage,
    currentStep,
    currentStepIndex: currentStepIndex + 1,
    totalSteps: ORDERED_STEPS.length,
    currentStepConfig: ONBOARDING_STEPS[currentStep],
    answers,
    setAnswers,
    canGoBack: !isFirstStep,
    canGoNext: canGoNext(),
    isLastStep,
    goBack,
    goNext,
    skipOnboarding,
    completeOnboarding,
  };
}
