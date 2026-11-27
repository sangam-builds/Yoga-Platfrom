"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Gift,
  Clock,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  Star,
} from "lucide-react";
import type { RankedRecommendation } from "@/modules/recommendations/recommendations.service";

export default function WelcomeFirstBookingPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<RankedRecommendation[]>([]);
  const [creditsRemaining, setCreditsRemaining] = useState<number>(5);
  const [userTimezone, setUserTimezone] = useState<string>("Asia/Kolkata");
  const [bookingLoadingId, setBookingLoadingId] = useState<string | null>(null);
  const [bookedSessions, setBookedSessions] = useState<Record<string, string>>({}); // sessionId -> bookingNumber
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isNotifyMeSuccess, setIsNotifyMeSuccess] = useState(false);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/recommendations?context=first-booking");
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?next=/welcome");
            return;
          }
          throw new Error("Failed to load recommendations");
        }

        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setCreditsRemaining(data.creditsRemaining ?? 5);
        if (data.userTimezone) setUserTimezone(data.userTimezone);
      } catch (err: any) {
        setFeedback({
          type: "error",
          text: err.message || "Failed to load class suggestions.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadRecommendations();
  }, [router]);

  const handleBookSession = async (sessionId: string, classTitle: string) => {
    try {
      setBookingLoadingId(sessionId);
      setFeedback(null);

      const res = await fetch(`/api/sessions/${sessionId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Booking failed.");
      }

      setBookedSessions((prev) => ({
        ...prev,
        [sessionId]: data.bookingNumber || "CONFIRMED",
      }));

      setCreditsRemaining((prev) => Math.max(0, prev - 1));

      setFeedback({
        type: "success",
        text: `You're booked for ${classTitle}! 1 credit used (${Math.max(0, creditsRemaining - 1)} credits remaining).`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Could not complete booking.",
      });
    } finally {
      setBookingLoadingId(null);
    }
  };

  const formatSessionTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat("en-US", {
        timeZone: userTimezone,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(d);
    } catch {
      return new Date(isoString).toLocaleString();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-canvas)]">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[var(--primary-sage)] animate-spin mx-auto" />
          <p className="font-outfit text-sm text-[var(--text-muted)] tracking-wide">
            Curating your tailored classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased font-figtree py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header / Skip Link */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--sage-tint)] text-[var(--primary-sage)] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRACTICE PROFILE READY</span>
            </div>
            <h1 className="font-outfit text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
              Welcome to ZenFlow.
            </h1>
            <p className="font-figtree text-sm sm:text-base text-[var(--text-muted)] mt-1.5 max-w-xl">
              Your 7-day free trial is active with{" "}
              <strong className="text-[var(--text-primary)] font-semibold">
                {creditsRemaining} class credits
              </strong>
              . Choose your first class below to begin.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5"
          >
            <span>Skip to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </header>

        {/* Feedback Alert */}
        {feedback && (
          <div
            role="alert"
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 ${
              feedback.type === "success"
                ? "bg-[var(--sage-tint)] border border-[var(--primary-sage)]/30 text-[var(--text-primary)]"
                : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-[var(--primary-sage)] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <span>{feedback.text}</span>
              {feedback.type === "success" && (
                <div className="mt-2">
                  <Link
                    href="/dashboard/bookings"
                    className="inline-flex items-center gap-1 font-semibold text-[var(--primary-sage)] hover:underline"
                  >
                    <span>View booked classes in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Grid or Empty State */}
        {recommendations.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-outfit text-lg font-semibold text-[var(--text-primary)]">
                Handpicked Beginner Classes
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                Times shown in {userTimezone}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {recommendations.map((rec) => {
                const isBooked = Boolean(bookedSessions[rec.sessionId]);
                const isBooking = bookingLoadingId === rec.sessionId;

                return (
                  <article
                    key={rec.sessionId}
                    className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--primary-sage)]/40 transition-all shadow-xs"
                  >
                    <div>
                      {/* Match reasons badge & Style */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--sage-tint)] text-[var(--primary-sage)] uppercase tracking-wider">
                          {rec.style}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                          {rec.durationMin} min
                        </span>
                        {rec.matchReasons[0] && (
                          <span className="text-[11px] font-medium text-[var(--primary-sage)] truncate max-w-[200px]">
                            • {rec.matchReasons[0]}
                          </span>
                        )}
                      </div>

                      {/* Class Title */}
                      <h3 className="font-outfit text-lg sm:text-xl font-semibold text-[var(--text-primary)] leading-snug mb-2">
                        {rec.title}
                      </h3>

                      <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 mb-4 leading-relaxed">
                        {rec.description}
                      </p>

                      {/* Session Time & Instructor */}
                      <div className="space-y-2 py-3 border-t border-b border-[var(--border-hairline)] text-xs text-[var(--text-muted)] mb-4">
                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
                          <Clock className="w-4 h-4 text-[var(--primary-sage)] shrink-0" />
                          <span>{formatSessionTime(rec.startsAt)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                            <span>{rec.instructor.name}</span>
                          </div>
                          {rec.instructor.ratingAvg > 0 && (
                            <div className="flex items-center gap-1 text-[var(--text-primary)] font-semibold">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{rec.instructor.ratingAvg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booking Action */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-[var(--text-muted)]">
                        {rec.spotsRemaining} spots left • 1 credit
                      </span>

                      {isBooked ? (
                        <span className="px-4 py-2.5 rounded-xl bg-[var(--sage-tint)] text-[var(--primary-sage)] text-xs font-semibold inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Booked!</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBookSession(rec.sessionId, rec.title)}
                          disabled={isBooking || creditsRemaining <= 0}
                          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-sage)] ${
                            creditsRemaining > 0 && !isBooking
                              ? "bg-[var(--primary-sage)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] shadow-xs"
                              : "bg-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
                          }`}
                        >
                          {isBooking ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Booking...</span>
                            </>
                          ) : (
                            <span>Book with 1 Credit</span>
                          )}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State when no classes scheduled */
          <div className="p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="font-outfit text-xl font-semibold text-[var(--text-primary)]">
              New live sessions are being scheduled
            </h2>
            <p className="font-figtree text-sm text-[var(--text-muted)] leading-relaxed">
              Instructors publish new beginner slots every morning. You can continue to your dashboard to explore on-demand pose libraries or request a reminder.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {!isNotifyMeSuccess ? (
                <button
                  type="button"
                  onClick={() => setIsNotifyMeSuccess(true)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--primary-sage)] text-[var(--on-primary)] text-xs sm:text-sm font-semibold hover:bg-[var(--primary-hover)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify me when slots open</span>
                </button>
              ) : (
                <span className="text-xs text-[var(--primary-sage)] font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Reminder confirmed! We will notify you.
                </span>
              )}
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <footer className="pt-6 border-t border-[var(--border-hairline)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Free trial active for 7 days. Renews only if you choose a membership.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--primary-sage)] hover:underline"
          >
            <span>Proceed to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </footer>
      </div>
    </div>
  );
}
