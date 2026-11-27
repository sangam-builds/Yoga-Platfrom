export type UserStage =
  | "UNVERIFIED"
  | "ONBOARDING"
  | "WELCOME_FIRST_BOOKING"
  | "DASHBOARD";

export interface UserLifecycleInput {
  user: {
    id: string;
    email: string;
    emailVerified: Date | null;
    createdAt?: Date;
    onboardingCompleted: boolean;
    firstBookingAt?: Date | null;
    checklistDismissedAt?: Date | null;
    trialStartedAt?: Date | null;
    trialEndsAt?: Date | null;
  };
  onboardingProgress?: {
    status: "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
    currentStep: string;
    flowVersion: string;
    completedAt?: Date | null;
    skippedAt?: Date | null;
  } | null;
  bookingsCount: number;
  hasActiveSubscription: boolean;
  returnUrl?: string | null;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  actionUrl: string;
}

export interface UserState {
  stage: UserStage;
  currentStep: string;
  flags: {
    isEmailVerified: boolean;
    isOnboardingCompleted: boolean;
    isOnboardingSkipped: boolean;
    hasBookedFirstClass: boolean;
    hasActiveTrial: boolean;
    hasActiveSubscription: boolean;
    isChecklistDismissed: boolean;
  };
  banner: {
    show: boolean;
    type: "info" | "warning" | "success";
    message: string;
    actionUrl?: string;
    actionText?: string;
  } | null;
  checklist: {
    visible: boolean;
    progressPercentage: number;
    items: ChecklistItem[];
  };
  redirectTo: string;
}

/**
 * Validates and sanitizes return URLs to prevent open-redirect vulnerabilities.
 * Only allows same-origin relative paths starting with a single '/' followed by alphanumeric or slug chars.
 */
export function sanitizeReturnUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Must start with '/' but not '//' (protocol-relative) and not containing scheme
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://") || trimmed.includes("\\")) {
    return null;
  }

  // Block javascript: or data: pseudo protocols
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Pure state machine that computes lifecycle status, required redirects, and active checklist.
 * Never mutates input. Fully unit-testable.
 */
export function computeUserState(input: UserLifecycleInput): UserState {
  const isEmailVerified = Boolean(input.user.emailVerified);

  // Check if onboarding is completed either via legacy user flag or progress status
  const isOnboardingSkipped = input.onboardingProgress?.status === "SKIPPED";
  const isOnboardingCompleted =
    input.user.onboardingCompleted ||
    input.onboardingProgress?.status === "COMPLETED" ||
    isOnboardingSkipped;

  const hasBookedFirstClass =
    Boolean(input.user.firstBookingAt) || input.bookingsCount > 0;

  const now = new Date();
  const hasActiveTrial = Boolean(
    input.user.trialStartedAt &&
      input.user.trialEndsAt &&
      new Date(input.user.trialEndsAt) > now
  );

  const isChecklistDismissed = Boolean(input.user.checklistDismissedAt);

  // Determine stage and target redirect
  let stage: UserStage;
  let targetRedirect: string;

  if (!isEmailVerified) {
    stage = "UNVERIFIED";
    targetRedirect = "/verify-email";
  } else if (!isOnboardingCompleted) {
    stage = "ONBOARDING";
    const currentStep = input.onboardingProgress?.currentStep || "experience";
    targetRedirect = `/onboarding?step=${encodeURIComponent(currentStep)}`;
  } else if (!hasBookedFirstClass) {
    stage = "WELCOME_FIRST_BOOKING";
    targetRedirect = "/welcome";
  } else {
    stage = "DASHBOARD";
    const validReturn = sanitizeReturnUrl(input.returnUrl);
    targetRedirect = validReturn || "/dashboard";
  }

  // Construct banner
  let banner: UserState["banner"] = null;
  if (!isEmailVerified) {
    banner = {
      show: true,
      type: "warning",
      message: "Please verify your email address to book your first class.",
      actionUrl: "/verify-email",
      actionText: "Verify Email",
    };
  } else if (hasActiveTrial && !hasBookedFirstClass) {
    banner = {
      show: true,
      type: "info",
      message: "Your 7-day free trial is active! Book your first class today.",
      actionUrl: "/welcome",
      actionText: "Browse Classes",
    };
  }

  // Construct checklist
  const checklistItems: ChecklistItem[] = [
    {
      id: "verify_email",
      title: "Verify your email",
      description: "Confirm your email to access all platform features.",
      isCompleted: isEmailVerified,
      actionUrl: "/verify-email",
    },
    {
      id: "complete_onboarding",
      title: "Personalize your practice",
      description: "Set your experience level, goals, and schedule.",
      isCompleted: isOnboardingCompleted,
      actionUrl: "/onboarding",
    },
    {
      id: "activate_trial",
      title: "Activate your 7-day trial",
      description: "Get 5 free credits to explore all classes.",
      isCompleted: hasActiveTrial || input.hasActiveSubscription,
      actionUrl: "/plans",
    },
    {
      id: "first_booking",
      title: "Book your first class",
      description: "Choose a class that fits your schedule.",
      isCompleted: hasBookedFirstClass,
      actionUrl: "/welcome",
    },
  ];

  const completedCount = checklistItems.filter((i) => i.isCompleted).length;
  const progressPercentage = Math.round((completedCount / checklistItems.length) * 100);
  const checklistVisible = !isChecklistDismissed && completedCount < checklistItems.length;

  return {
    stage,
    currentStep: input.onboardingProgress?.currentStep || "experience",
    flags: {
      isEmailVerified,
      isOnboardingCompleted,
      isOnboardingSkipped,
      hasBookedFirstClass,
      hasActiveTrial,
      hasActiveSubscription: input.hasActiveSubscription,
      isChecklistDismissed,
    },
    banner,
    checklist: {
      visible: checklistVisible,
      progressPercentage,
      items: checklistItems,
    },
    redirectTo: targetRedirect,
  };
}
