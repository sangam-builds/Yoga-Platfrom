"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Leaf,
  AlertCircle,
  CheckCircle2,
  X,
  HelpCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface YogaAuthSplitViewProps {
  initialTab?: "signin" | "signup";
}

export function YogaAuthSplitView({ initialTab = "signin" }: YogaAuthSplitViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(true);

  // UI / Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Contact Studio / Forgot Password Dialog State
  const [showContactModal, setShowContactModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Password Strength calculation for Sign Up
  const passwordStrength = useMemo(() => {
    if (!signUpPassword) return { score: 0, label: "", color: "" };
    let score = 0;
    if (signUpPassword.length >= 8) score++;
    if (/[A-Z]/.test(signUpPassword)) score++;
    if (/[0-9]/.test(signUpPassword)) score++;
    if (/[^A-Za-z0-9]/.test(signUpPassword)) score++;

    if (score <= 1) return { score: 1, label: "Weak", barColor: "bg-red-400", textColor: "text-red-600" };
    if (score <= 3) return { score: 2, label: "Medium", barColor: "bg-amber-400", textColor: "text-amber-600" };
    return { score: 3, label: "Strong", barColor: "bg-[#47664A]", textColor: "text-[#47664A]" };
  }, [signUpPassword]);

  // Handle Tab Switch
  const handleTabChange = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
    // Update browser URL silently without full reload
    const newPath = tab === "signin" ? "/login" : "/signup";
    window.history.replaceState(null, "", newPath);
  };

  // Sign In Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Your email has not been confirmed yet. Please verify your email inbox.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (!data.user) {
        setErrorMessage("Unable to authenticate. Please verify your credentials.");
        return;
      }

      const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
      const nextParam = searchParams?.get("next");

      let destination = "/dashboard";
      if (nextParam) {
        destination = nextParam;
      } else if (role === "ADMIN" || signInEmail.toLowerCase().includes("admin@zenflow")) {
        destination = "/admin";
      } else if (role === "INSTRUCTOR") {
        destination = "/instructor";
      }

      setSuccessMessage("Welcome back. Entering your sanctuary...");
      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!signUpPassword || signUpPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!agreeToTerms) {
      setErrorMessage("Please agree to the Terms of Service to create an account.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // If session established immediately (email confirmation disabled in Supabase)
      if (data.session) {
        setSuccessMessage("Account created! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 600);
      } else {
        setSuccessMessage("Account created successfully! Check your inbox to confirm your practice.");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Unable to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      if (error) {
        setErrorMessage(`Google sign-in error: ${error.message}`);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Failed to initiate Google Sign-In.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Send Password Reset
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setResetSent(true);
    } catch {
      // Non-blocking security best practice
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF6ED] text-[#29352F] antialiased">
      {/* ========================================================= */}
      {/* LEFT COLUMN: Photographic Yoga Sanctuary Visual            */}
      {/* ========================================================= */}
      <div className="hidden lg:relative lg:flex lg:flex-col lg:justify-between lg:w-1/2 min-h-screen bg-[#2D3F33] overflow-hidden select-none p-10">
        <Image
          src="/images/yoga-login.jpg"
          alt="ZenFlow Yoga Sanctuary"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />

        {/* Ambient warmth & legibility gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/30 pointer-events-none" />

        {/* Top Header Overlay */}
        <div className="relative z-10 flex items-center justify-between w-full font-outfit">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-white/70 flex items-center justify-center backdrop-blur-2xs">
              <Leaf className="w-3.5 h-3.5 text-white stroke-[1.8]" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-white uppercase drop-shadow-xs">
              YOGA STUDIO
            </span>
          </div>

          {/* Slogan */}
          <span className="text-[10px] font-medium tracking-[0.25em] text-white/85 uppercase drop-shadow-xs">
            MOVE WITH INTENTION
          </span>
        </div>

        {/* Bottom Headline Overlay */}
        <div className="relative z-10 text-white max-w-md pb-2 font-outfit">
          <p className="text-xs font-bold tracking-[0.25em] text-white/90 uppercase mb-3 drop-shadow-xs">
            A LITTLE SPACE FOR YOU
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-medium text-white leading-[1.12] tracking-tight drop-shadow-sm">
            Come back to the way you feel.
          </h2>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: Authentication Form Panel                   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative bg-[#FAF6ED] font-figtree">
        {/* Top Header / Switch Mode Link */}
        <div className="w-full flex items-center justify-between">
          {/* Mobile Brand Leaf */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E1EDDD] text-[#35523E] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#35523E]" />
            </div>
            <span className="font-outfit text-xs uppercase tracking-[0.2em] font-bold text-[#47664A]">
              ZenFlow Studio
            </span>
          </div>

          <div className="ml-auto text-xs sm:text-sm text-[#6C7B72] font-figtree">
            {activeTab === "signin" ? (
              <>
                New to the practice?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("signup")}
                  className="font-semibold text-[#29352F] hover:text-[#47664A] hover:underline transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("signin")}
                  className="font-semibold text-[#29352F] hover:text-[#47664A] hover:underline transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {/* Leaf Icon in Soft Sage Circle */}
          <div className="w-12 h-12 rounded-full bg-[#E1EDDD] text-[#35523E] flex items-center justify-center mb-5 shadow-xs">
            <Leaf className="w-5 h-5 text-[#35523E]" />
          </div>

          {/* Eyebrow */}
          <p className="font-outfit text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#607B6A] uppercase mb-2">
            YOUR PRACTICE AWAITS
          </p>

          {/* Title */}
          <h1 className="font-outfit text-3xl sm:text-4xl font-semibold text-[#29352F] tracking-tight mb-2">
            {activeTab === "signin" ? "Welcome back." : "Create an account."}
          </h1>

          {/* Subtitle */}
          <p className="font-figtree text-sm text-[#6C7B72] mb-7 leading-relaxed">
            {activeTab === "signin"
              ? "Sign in to pick up where your practice left off."
              : "Join our mindful community and begin your practice today."}
          </p>

          {/* Full-width 50/50 Dual Segmented Underline Tabs */}
          <div className="w-full grid grid-cols-2 mb-7 text-sm sm:text-[15px] font-figtree select-none relative">
            {/* Tab 1: Sign in */}
            <button
              type="button"
              onClick={() => handleTabChange("signin")}
              className={`w-full pb-3 text-center transition-colors cursor-pointer relative ${
                activeTab === "signin"
                  ? "text-[#29352F] font-semibold"
                  : "text-[#5C6B63] hover:text-[#29352F] font-medium"
              }`}
            >
              <span>Sign in</span>
              <span
                className={`absolute bottom-0 left-0 right-0 transition-all ${
                  activeTab === "signin"
                    ? "h-[2px] bg-[#47664A]"
                    : "h-[1px] bg-[#D1DBCF]"
                }`}
              />
            </button>

            {/* Tab 2: Create account */}
            <button
              type="button"
              onClick={() => handleTabChange("signup")}
              className={`w-full pb-3 text-center transition-colors cursor-pointer relative ${
                activeTab === "signup"
                  ? "text-[#29352F] font-semibold"
                  : "text-[#5C6B63] hover:text-[#29352F] font-medium"
              }`}
            >
              <span>Create account</span>
              <span
                className={`absolute bottom-0 left-0 right-0 transition-all ${
                  activeTab === "signup"
                    ? "h-[2px] bg-[#47664A]"
                    : "h-[1px] bg-[#D1DBCF]"
                }`}
              />
            </button>
          </div>

          {/* Alerts: Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl text-xs bg-[#FBF1F0] border border-[#F0D5D3] text-[#A63A36] flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-[#C2413C] shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Alerts: Success Message */}
          {successMessage && (
            <div
              role="status"
              className="mb-5 p-3.5 rounded-xl text-xs bg-[#EDF5EE] border border-[#CDE5D1] text-[#2D5A37] flex items-start gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-[#47664A] shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 1: SIGN IN FORM                                   */}
          {/* ===================================================== */}
          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              {/* Email Input */}
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-sm font-medium text-[#29352F] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-3 focus-within:border-[#47664A] focus-within:ring-2 focus-within:ring-[#47664A]/15 transition-all">
                  <Mail className="w-4 h-4 text-[#637063] shrink-0 mr-3" />
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-transparent text-sm text-[#29352F] placeholder:text-[#6C7B72] outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-sm font-medium text-[#29352F] mb-1.5"
                >
                  Password
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-3 focus-within:border-[#47664A] focus-within:ring-2 focus-within:ring-[#47664A]/15 transition-all">
                  <Lock className="w-4 h-4 text-[#637063] shrink-0 mr-3" />
                  <input
                    id="signin-password"
                    type={showSignInPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-transparent text-sm text-[#29352F] placeholder:text-[#6C7B72] outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    aria-label={showSignInPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 text-[#637063] hover:text-[#29352F] transition-colors cursor-pointer"
                  >
                    {showSignInPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Forgot Password Helper */}
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(signInEmail);
                      setShowContactModal(true);
                    }}
                    className="text-xs text-[#78867E] hover:text-[#47664A] hover:underline transition-colors cursor-pointer"
                  >
                    Forgot your password? Contact your studio.
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#47664A] hover:bg-[#3B563E] active:bg-[#324935] text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E4DFD5]" />
                </div>
                <span className="relative bg-[#FAF6ED] px-4 text-xs text-[#8A978F]">
                  or continue with
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl border border-[#D1DBCF] bg-[#FAF6EE] hover:bg-[#F3EFE5] text-[#29352F] text-sm font-medium transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            </form>
          ) : (
            /* ===================================================== */
            /* TAB 2: CREATE ACCOUNT FORM                            */
            /* ===================================================== */
            <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-[#29352F] mb-1.5"
                >
                  Full name
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-3 focus-within:border-[#47664A] focus-within:ring-2 focus-within:ring-[#47664A]/15 transition-all">
                  <User className="w-4 h-4 text-[#637063] shrink-0 mr-3" />
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Jane Doe"
                    value={signUpName}
                    onChange={(e) => {
                      setSignUpName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-transparent text-sm text-[#29352F] placeholder:text-[#6C7B72] outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-[#29352F] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-3 focus-within:border-[#47664A] focus-within:ring-2 focus-within:ring-[#47664A]/15 transition-all">
                  <Mail className="w-4 h-4 text-[#637063] shrink-0 mr-3" />
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => {
                      setSignUpEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-transparent text-sm text-[#29352F] placeholder:text-[#6C7B72] outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-[#29352F] mb-1.5"
                >
                  Password
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-3 focus-within:border-[#47664A] focus-within:ring-2 focus-within:ring-[#47664A]/15 transition-all">
                  <Lock className="w-4 h-4 text-[#637063] shrink-0 mr-3" />
                  <input
                    id="signup-password"
                    type={showSignUpPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="At least 8 characters"
                    value={signUpPassword}
                    onChange={(e) => {
                      setSignUpPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-transparent text-sm text-[#29352F] placeholder:text-[#6C7B72] outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 text-[#637063] hover:text-[#29352F] transition-colors cursor-pointer"
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {signUpPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1 h-1 w-full bg-[#E5DFD4] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 1 ? passwordStrength.barColor : "bg-transparent"
                        } w-1/3`}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 2 ? passwordStrength.barColor : "bg-transparent"
                        } w-1/3`}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 3 ? passwordStrength.barColor : "bg-transparent"
                        } w-1/3`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#78867E]">
                      <span>Password strength</span>
                      <span className={`font-semibold ${passwordStrength.textColor}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-sm font-medium text-[#29352F] mb-1.5"
                >
                  Confirm password
                </label>
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-3 focus-within:border-[#47664A] focus-within:ring-2 focus-within:ring-[#47664A]/15 transition-all">
                  <Lock className="w-4 h-4 text-[#637063] shrink-0 mr-3" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="Re-enter your password"
                    value={signUpConfirmPassword}
                    onChange={(e) => {
                      setSignUpConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-transparent text-sm text-[#29352F] placeholder:text-[#6C7B72] outline-none"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#6C7B72] select-none">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#47664A] focus:ring-[#47664A] border-[#D1DBCF] bg-[#FAF6EE] cursor-pointer"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#29352F] font-medium underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#29352F] font-medium underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Sign Up Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#47664A] hover:bg-[#3B563E] active:bg-[#324935] text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E4DFD5]" />
                </div>
                <span className="relative bg-[#FAF6ED] px-4 text-xs text-[#8A978F]">
                  or continue with
                </span>
              </div>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl border border-[#D1DBCF] bg-[#FAF6EE] hover:bg-[#F3EFE5] text-[#29352F] text-sm font-medium transition-all flex items-center justify-center gap-3 shadow-2xs cursor-pointer disabled:opacity-60"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
            </form>
          )}
        </div>

        {/* Bottom studio footnote */}
        <div className="w-full text-center text-[11px] text-[#8C9B92] pt-4">
          Move with intention &middot; ZenFlow Mindful Sanctuary &middot; All rights reserved.
        </div>
      </div>

      {/* ========================================================= */}
      {/* Contact Studio / Forgot Password Modal                     */}
      {/* ========================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF6ED] border border-[#DDD8CE] rounded-2xl p-6 max-w-sm w-full shadow-xl relative animate-scaleUp text-[#29352F]">
            <button
              type="button"
              onClick={() => {
                setShowContactModal(false);
                setResetSent(false);
              }}
              className="absolute top-4 right-4 text-[#8C9B92] hover:text-[#29352F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#E1EDDD] text-[#35523E] flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="font-outfit text-xl font-semibold text-[#29352F] mb-1.5">
              Contact Your Studio
            </h3>
            <p className="text-xs text-[#6C7B72] mb-4 leading-relaxed">
              Enter your email address below and we will send you a secure link to reset your
              practice password.
            </p>

            {resetSent ? (
              <div className="bg-[#EDF5EE] border border-[#CDE5D1] text-[#2D5A37] p-3 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#47664A]" />
                <span>
                  If an account exists for <strong>{resetEmail}</strong>, password reset
                  instructions have been sent to your inbox.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSendResetEmail} className="space-y-3">
                <div className="relative flex items-center bg-[#FAF6EE] border border-[#D1DBCF] rounded-xl px-3.5 py-2.5 focus-within:border-[#47664A] transition-all">
                  <Mail className="w-4 h-4 text-[#637063] shrink-0 mr-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-[#29352F] placeholder:text-[#6C7B72] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#47664A] hover:bg-[#3B563E] text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {resetLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-[11px] text-[#78867E]">
                    Need direct help? Reach our concierge at{" "}
                    <a
                      href="mailto:support@zenflow.yoga"
                      className="font-semibold text-[#47664A] hover:underline"
                    >
                      support@zenflow.yoga
                    </a>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

