export const ONBOARDING_FLOW_VERSION = "v1";

export type StepId =
  | "experience"
  | "goals"
  | "limitations"
  | "styles"
  | "schedule"
  | "weekly_goal"
  | "locale"
  | "summary";

export interface StepOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface StepConfig {
  id: StepId;
  stepNumber: number;
  totalSteps: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  isRequired: boolean;
  isMultiSelect?: boolean;
  options?: StepOption[];
}

export const ONBOARDING_STEPS: Record<StepId, StepConfig> = {
  experience: {
    id: "experience",
    stepNumber: 1,
    totalSteps: 7,
    eyebrow: "STEP 1 OF 7",
    title: "What is your yoga experience?",
    subtitle: "We'll tailor the pace, cues, and sequence difficulty to you.",
    isRequired: true,
    options: [
      {
        id: "BEGINNER",
        label: "Beginner",
        description: "New to yoga or returning after a long break. Clear cues and foundation poses.",
        icon: "Sprout",
      },
      {
        id: "INTERMEDIATE",
        label: "Some Experience",
        description: "Familiar with basic asanas, sun salutations, and breathing techniques.",
        icon: "Flame",
      },
      {
        id: "ADVANCED",
        label: "Advanced",
        description: "Practicing regularly for years. Comfortable with inversions, arm balances, and flow.",
        icon: "Crown",
      },
    ],
  },
  goals: {
    id: "goals",
    stepNumber: 2,
    totalSteps: 7,
    eyebrow: "STEP 2 OF 7",
    title: "What are your primary goals?",
    subtitle: "Select all that feel important to your practice right now.",
    isRequired: true,
    isMultiSelect: true,
    options: [
      { id: "flexibility", label: "Flexibility & Mobility", description: "Release muscle tightness and increase range of motion.", icon: "Activity" },
      { id: "stress_relief", label: "Stress Relief & Calm", description: "Soothe nervous system and release mental tension.", icon: "Heart" },
      { id: "strength", label: "Core & Full-Body Strength", description: "Build lean muscle, stability, and endurance.", icon: "Dumbbell" },
      { id: "weight_management", label: "Weight & Vitality", description: "Active dynamic flows to energize metabolism.", icon: "Zap" },
      { id: "better_sleep", label: "Better Sleep", description: "Evening wind-down and restorative deep rest.", icon: "Moon" },
      { id: "posture", label: "Better Posture & Alignment", description: "Counter desk sitting, neck strain, and hunching.", icon: "Sparkles" },
      { id: "mindfulness", label: "Mindfulness & Breath", description: "Pranayama breathwork and mindful presence.", icon: "Wind" },
      { id: "fitness", label: "General Health & Fitness", description: "Consistent movement habit for longevity.", icon: "Smile" },
    ],
  },
  limitations: {
    id: "limitations",
    stepNumber: 3,
    totalSteps: 7,
    eyebrow: "STEP 3 OF 7",
    title: "Any injuries or physical considerations?",
    subtitle: "Used only to suggest safe modifications. Never shown to other students.",
    isRequired: false,
    isMultiSelect: true,
    options: [
      { id: "none", label: "No current limitations", description: "I'm ready for standard variations." },
      { id: "back", label: "Lower or upper back sensitivity", description: "Gentle spinal twists and supported folds." },
      { id: "knees", label: "Knee sensitivity", description: "Padded support and restricted deep knee bends." },
      { id: "shoulders", label: "Shoulder tightness / injury", description: "Gentle arm reaches and modified planks." },
      { id: "wrists", label: "Wrist sensitivity", description: "Forearm variations and fist/block support." },
      { id: "pregnancy", label: "Prenatal / Pregnancy", description: "Safe prenatal poses and open abdomen." },
      { id: "recent_injury", label: "Recent injury or surgery", description: "Very gentle, restorative movements." },
      { id: "other", label: "Other physical consideration", description: "Add a note or discuss with instructor." },
    ],
  },
  styles: {
    id: "styles",
    stepNumber: 4,
    totalSteps: 7,
    eyebrow: "STEP 4 OF 7",
    title: "Which yoga styles interest you?",
    subtitle: "Choose one or more styles. You can always explore other styles later.",
    isRequired: true,
    isMultiSelect: true,
    options: [
      { id: "HATHA", label: "Hatha", description: "Classic postures held mindfully with steady breathing." },
      { id: "VINYASA", label: "Vinyasa Flow", description: "Dynamic movement synchronized with breath." },
      { id: "YIN", label: "Yin Yoga", description: "Deep floor postures held passively for 3–5 minutes." },
      { id: "ASHTANGA", label: "Ashtanga", description: "Structured, vigorous sequence building discipline." },
      { id: "POWER", label: "Power Yoga", description: "Athletic, strength-building, sweat-inducing flows." },
      { id: "PRENATAL", label: "Prenatal Yoga", description: "Nurturing, safe sequences designed for expectant mothers." },
      { id: "MEDITATION", label: "Meditation", description: "Guided stillness, awareness, and mental clarity." },
      { id: "BREATHWORK", label: "Pranayama Breathwork", description: "Traditional yogic breathing practices for energy and calm." },
    ],
  },
  schedule: {
    id: "schedule",
    stepNumber: 5,
    totalSteps: 7,
    eyebrow: "STEP 5 OF 7",
    title: "When do you prefer to practice?",
    subtitle: "We'll highlight live sessions and classes during your active hours.",
    isRequired: false,
    isMultiSelect: true,
    options: [
      { id: "MORNING", label: "Morning (6 AM – 11 AM)", description: "Energizing wakeup flows to start the day.", icon: "Sun" },
      { id: "AFTERNOON", label: "Afternoon (11 AM – 4 PM)", description: "Midday reset, recharge, and spine release.", icon: "Sunrise" },
      { id: "EVENING", label: "Evening (4 PM – 10 PM)", description: "Wind-down, stress relief, and restorative sleep prep.", icon: "Sunset" },
    ],
  },
  weekly_goal: {
    id: "weekly_goal",
    stepNumber: 6,
    totalSteps: 7,
    eyebrow: "STEP 6 OF 7",
    title: "Set your weekly practice goal",
    subtitle: "Consistency over intensity. Most yogis start with 2–3 classes per week.",
    isRequired: true,
    options: [
      { id: "1", label: "1 class / week", description: "Light commitment to build a steady routine." },
      { id: "2", label: "2 classes / week", description: "Balanced cadence for noticeable flexibility gains." },
      { id: "3", label: "3 classes / week (Recommended)", description: "Optimal sweet spot for strength and stress reduction." },
      { id: "4", label: "4 classes / week", description: "Deepening your practice and body transformation." },
      { id: "5", label: "5+ classes / week", description: "Daily dedication for immersive wellness." },
    ],
  },
  locale: {
    id: "locale",
    stepNumber: 7,
    totalSteps: 7,
    eyebrow: "STEP 7 OF 7",
    title: "Confirm timezone & language",
    subtitle: "We detected these from your device. Adjust if needed.",
    isRequired: true,
  },
  summary: {
    id: "summary",
    stepNumber: 8,
    totalSteps: 8,
    eyebrow: "ALL SET",
    title: "Here is your personalized practice profile",
    subtitle: "Review your choices. You can refine these anytime in your Settings.",
    isRequired: false,
  },
};

export const ORDERED_STEPS: StepId[] = [
  "experience",
  "goals",
  "limitations",
  "styles",
  "schedule",
  "weekly_goal",
  "locale",
  "summary",
];

export function getNextStep(currentStep: StepId): StepId {
  const index = ORDERED_STEPS.indexOf(currentStep);
  if (index === -1 || index >= ORDERED_STEPS.length - 1) {
    return "summary";
  }
  return ORDERED_STEPS[index + 1];
}

export function getPreviousStep(currentStep: StepId): StepId | null {
  const index = ORDERED_STEPS.indexOf(currentStep);
  if (index <= 0) {
    return null;
  }
  return ORDERED_STEPS[index - 1];
}
