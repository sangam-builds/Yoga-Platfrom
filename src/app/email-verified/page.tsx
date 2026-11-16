"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Mail,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Leaf,
  Home,
  Clock,
  Check,
  Pause,
  Play,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function EmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(6);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    // 1. Read email and error from query parameters
    const queryEmail = searchParams?.get("email");
    const queryError = searchParams?.get("error");

    if (queryEmail) {
      setEmail(queryEmail);
    }
    if (queryError) {
      setErrorMsg(decodeURIComponent(queryError));
      return;
    }

    // 2. Client-side check for active session or hash fragment tokens
    async function checkSession() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {
          setEmail(session.user.email);
        } else {
          // If hash fragments contain access token
          if (typeof window !== "undefined" && window.location.hash) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get("access_token");
            if (accessToken) {
              setIsVerifying(true);
              const { data: userData } = await supabase.auth.getUser(accessToken);
              if (userData?.user?.email) {
                setEmail(userData.user.email);
              }
              setIsVerifying(false);
            }
          }
        }
      } catch (err) {
        console.error("Session inspection error:", err);
      }
    }

    checkSession();
  }, [searchParams]);

  // Auto-redirect countdown to login
  useEffect(() => {
    if (errorMsg || isPaused || isVerifying) return;

    if (countdown <= 0) {
      const loginUrl = email
        ? `/login?verified=true&email=${encodeURIComponent(email)}`
        : "/login?verified=true";
      router.push(loginUrl);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isPaused, errorMsg, isVerifying, email, router]);

  const targetLoginUrl = email
    ? `/login?verified=true&email=${encodeURIComponent(email)}`
    : "/login?verified=true";

  // Flow steps reflecting the authentication architecture
  const flowSteps = [
    { number: 1, title: "User Signup", desc: "Credentials submitted", status: "completed" },
    { number: 2, title: "Verification Sent", desc: "Link emailed via Supabase", status: "completed" },
    { number: 3, title: "Token Validated", desc: "Security token checked", status: "completed" },
    { number: 4, title: "Email Verified", desc: "Account activated", status: "current" },
    { number: 5, title: "Login Page", desc: "Sign in to practice", status: "upcoming" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF6ED] text-[#29352F] flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased selection:bg-[#47664A]/20">
      {/* ── Top Header Brand ── */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[#29352F] hover:opacity-85 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-[#E1EDDD] text-[#47664A] flex items-center justify-center shadow-xs">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-outfit text-lg font-bold tracking-tight leading-none text-[#29352F]">
              ZenFlow
            </span>
            <span className="font-figtree text-[10px] uppercase tracking-[0.2em] text-[#6C7B72] mt-0.5">
              Yoga Studio & Sanctuary
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#6C7B72] hover:text-[#29352F] flex items-center gap-1.5 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </header>

      {/* ── Main Sanctuary Card ── */}
      <main className="flex-1 flex items-center justify-center my-6">
        <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#D1DBCF] rounded-[28px] p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          {/* Subtle Ambient Decorative Gradient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#E1EDDD]/60 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* If Error state */}
          {errorMsg ? (
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                <AlertCircle className="w-10 h-10 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Verification Issue
                </span>
                <h1 className="font-outfit text-2xl sm:text-3xl font-semibold text-[#29352F]">
                  Verification Link Expired
                </h1>
                <p className="font-figtree text-xs sm:text-sm text-[#6C7B72] max-w-md mx-auto leading-relaxed">
                  {errorMsg || "This link may have already been used or has expired. Please sign in or request a new verification link."}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#47664A] hover:bg-[#3D573F] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#D1DBCF] bg-[#FAF6EE] hover:bg-[#FFFFFF] text-[#29352F] text-xs sm:text-sm font-medium transition-colors"
                >
                  <span>Create New Account</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="space-y-7">
              {/* Animated Success Badge */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#E1EDDD] animate-ping opacity-35" />
                <div className="relative w-20 h-20 rounded-full bg-[#E1EDDD] text-[#47664A] flex items-center justify-center ring-8 ring-[#E1EDDD]/50 shadow-xs">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.4]" />
                </div>
              </div>

              {/* Title & Copy */}
              <div className="space-y-2">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-[#47664A] bg-[#E1EDDD]/70 px-3.5 py-1 rounded-full border border-[#47664A]/20">
                  STEP 4 • VERIFICATION COMPLETE
                </span>
                <h1 className="font-outfit text-2xl sm:text-3xl font-semibold text-[#29352F] tracking-tight">
                  Email Verified Successfully!
                </h1>
                <p className="font-figtree text-xs sm:text-sm text-[#6C7B72] max-w-md mx-auto leading-relaxed">
                  Your email has been authenticated through Supabase. Your ZenFlow yoga sanctuary account is fully activated and ready for your mindful practice.
                </p>
              </div>

              {/* ── Authentication Flow Stepper (From Workflow Diagram) ── */}
              <div className="py-2 px-1 sm:px-2">
                <div className="border border-[#E4DFD3] bg-[#FAF6EF]/70 rounded-2xl p-4 sm:p-5 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#47664A]">
                      Authentication Flow
                    </span>
                    <span className="text-[11px] font-medium text-[#6C7B72]">
                      Step 4 of 5
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {flowSteps.map((step) => {
                      const isCompleted = step.status === "completed";
                      const isCurrent = step.status === "current";

                      return (
                        <div
                          key={step.number}
                          className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                            isCurrent
                              ? "bg-white border border-[#47664A] shadow-xs"
                              : isCompleted
                              ? "bg-[#E1EDDD]/50 border border-[#D1DBCF]"
                              : "bg-transparent border border-dashed border-[#D1DBCF]/80 opacity-60"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 ${
                              isCompleted
                                ? "bg-[#47664A] text-white"
                                : isCurrent
                                ? "bg-[#47664A] text-white ring-2 ring-[#47664A]/30"
                                : "bg-[#D1DBCF] text-[#6C7B72]"
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                          </div>
                          <span
                            className={`text-[10px] font-semibold leading-tight line-clamp-1 ${
                              isCurrent ? "text-[#47664A]" : "text-[#29352F]"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Verified Account Pill ── */}
              {email && (
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#D1DBCF] bg-[#FAF6EE] text-xs text-[#29352F]">
                  <Mail className="w-3.5 h-3.5 text-[#47664A]" />
                  <span className="font-medium">{email}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-semibold text-[#47664A] uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              )}

              {/* ── Primary Action to Login (Step 5) ── */}
              <div className="space-y-3 pt-1">
                <Link
                  href={targetLoginUrl}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#47664A] hover:bg-[#3D573F] text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer group"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Auto Redirect Countdown Bar */}
                <div className="flex items-center justify-between text-xs text-[#6C7B72] px-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#47664A]" />
                    <span>
                      Redirecting to Sign In in{" "}
                      <strong className="text-[#29352F]">{countdown}s</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPaused(!isPaused)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#47664A] hover:underline cursor-pointer"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Secondary Links ── */}
              <div className="pt-2 border-t border-[#E4DFD3] flex items-center justify-center gap-4 text-xs text-[#6C7B72]">
                <Link
                  href="/"
                  className="hover:text-[#29352F] transition-colors font-medium"
                >
                  Explore Studio
                </Link>
                <span>•</span>
                <Link
                  href="/login"
                  className="hover:text-[#29352F] transition-colors font-medium"
                >
                  Direct Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Subtle Philosophy Footer ── */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4">
        <p className="font-figtree text-xs text-[#6C7B72]">
          “Each breath is a new beginning. Step onto your mat with clarity.” • ZenFlow
        </p>
      </footer>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6ED] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#47664A]/20 border-t-[#47664A] rounded-full animate-spin" />
        </div>
      }
    >
      <EmailVerifiedContent />
    </Suspense>
  );
}
