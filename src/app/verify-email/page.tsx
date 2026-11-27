"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Edit3 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function VerifyEmailPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Load current auth user
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/verify-email");
        return;
      }

      setEmail(user.email || "");
      setNewEmail(user.email || "");

      // If user is already verified, proceed to onboarding
      if (user.email_confirmed_at) {
        router.push("/onboarding");
      }
    }

    loadUser();
  }, [router, supabase]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    try {
      setIsResending(true);
      setFeedbackMessage(null);

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;

      setFeedbackMessage({
        type: "success",
        text: "Verification email resent! Please check your inbox and spam folder.",
      });
      setResendCooldown(60);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Failed to resend verification email. Please try again shortly.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === email) {
      setIsEditingEmail(false);
      return;
    }

    try {
      setIsUpdatingEmail(true);
      setFeedbackMessage(null);

      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;

      setEmail(newEmail.trim());
      setIsEditingEmail(false);
      setFeedbackMessage({
        type: "success",
        text: `Confirmation link sent to ${newEmail.trim()}. Please verify your new address.`,
      });
      setResendCooldown(60);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "Failed to change email address.",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased font-figtree">
      {/* Visual Photo Sanctuary Panel */}
      <div className="hidden lg:relative lg:flex lg:flex-col lg:justify-between lg:w-1/2 min-h-screen bg-[#2D3F33] overflow-hidden select-none p-10">
        <Image
          src="/images/yoga-login.jpg"
          alt="ZenFlow Sanctuary"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/35 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between w-full font-outfit">
          <span className="text-[11px] font-bold tracking-[0.25em] text-white uppercase drop-shadow-xs">
            ZENFLOW STUDIO
          </span>
          <span className="text-[10px] font-medium tracking-[0.25em] text-white/85 uppercase drop-shadow-xs">
            EMAIL VERIFICATION
          </span>
        </div>

        <div className="relative z-10 text-white max-w-md pb-4 font-outfit">
          <p className="text-xs font-bold tracking-[0.25em] text-white/90 uppercase mb-3 drop-shadow-xs">
            ALMOST READY TO FLOW
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-white leading-[1.15] tracking-tight drop-shadow-sm">
            Please confirm your email address.
          </h2>
        </div>
      </div>

      {/* Main Verification Card Panel */}
      <main className="w-full lg:w-1/2 min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 relative bg-[var(--bg-canvas)]">
        <div className="w-full max-w-[440px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center mb-6 shadow-2xs">
            <Mail className="w-7 h-7 stroke-[1.8]" />
          </div>

          <p className="font-outfit text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[var(--primary-sage)] uppercase mb-2">
            STEP 1: VERIFY EMAIL
          </p>

          <h1 className="font-outfit text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">
            Check your inbox
          </h1>

          <p className="font-figtree text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              {email || "your email address"}
            </span>
            . Confirming your email helps secure your account and is required before booking your first class.
          </p>

          {/* Feedback Alerts */}
          {feedbackMessage && (
            <div
              role="alert"
              className={`mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                feedbackMessage.type === "success"
                  ? "bg-[var(--sage-tint)] border border-[var(--primary-sage)]/30 text-[var(--text-primary)]"
                  : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
              }`}
            >
              {feedbackMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--primary-sage)] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{feedbackMessage.text}</span>
            </div>
          )}

          {/* Resend & Change Email Actions */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)] ${
                resendCooldown > 0
                  ? "bg-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
                  : "bg-[var(--primary-sage)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] shadow-xs"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : isResending
                  ? "Sending..."
                  : "Resend verification email"}
              </span>
            </button>

            {/* Change Email Form / Toggle */}
            {!isEditingEmail ? (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5 hover:underline transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Entered the wrong email? Change it</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateEmail} className="pt-2 space-y-3">
                <label htmlFor="change-email" className="block text-xs font-medium text-[var(--text-primary)]">
                  Enter corrected email
                </label>
                <div className="flex gap-2">
                  <input
                    id="change-email"
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary-sage)] focus:ring-1 focus:ring-[var(--primary-sage)] outline-none"
                    placeholder="corrected@example.com"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary-sage)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] transition-colors cursor-pointer"
                  >
                    {isUpdatingEmail ? "Saving..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Non-blocking: Proceed to Personalization */}
            <div className="pt-4 border-t border-[var(--border-hairline)] text-center">
              <Link
                href="/onboarding"
                className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--primary-sage)] inline-flex items-center gap-1 hover:underline transition-colors"
              >
                <span>Continue to practice profile setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
