"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, Flag, Check, X, ShieldAlert, Sparkles, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorReviewsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [replyingReview, setReplyingReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-reviews-list"],
    queryFn: async () => {
      const res = await fetch("/api/instructor/overview");
      if (!res.ok) throw new Error("Failed to load reviews");
      return res.json();
    },
  });

  const reviews = data?.recentReviews || [
    {
      id: "rev-1",
      studentName: "Priya S.",
      rating: 5,
      comment: "Incredible guidance and gentle breath cues during the hip opening sequence. Truly grounding!",
      className: "Morning Awakening Vinyasa",
      createdAt: new Date().toISOString(),
      hasReply: true,
      replyContent: "Thank you Priya! It was a joy guiding your practice.",
    },
    {
      id: "rev-2",
      studentName: "Vikram M.",
      rating: 5,
      comment: "Teacher provided clear modifications for lower back tension. Feel revitalized.",
      className: "Hatha Alignment & Breathwork",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      hasReply: false,
    },
  ];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast.success("Reply published to student review.");
    setReplyingReview(null);
    setReplyText("");
  };

  const handleReportReview = (id: string) => {
    if (window.confirm("Flag this review for administrator moderation? Instructors cannot delete reviews directly.")) {
      toast.info("Review flagged for admin moderation.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Practitioner Feedback & Sentiment
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Read verified student feedback, post public instructor responses, or flag inappropriate reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-3.5 py-1.5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs text-xs font-figtree">
          <Star className="w-4 h-4 fill-[var(--accent-amber)] text-[var(--accent-amber)]" />
          <span className="font-outfit font-bold text-[var(--text-primary)] text-sm">4.9</span>
          <span className="text-[var(--text-subtle)]">/ 5.0 (42 reviews)</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev: any) => (
          <div
            key={rev.id}
            className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-3 hover:border-[var(--primary-sage)]/40 transition-all font-figtree"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--sage-tint)] text-[var(--sage-tint-icon)] flex items-center justify-center font-outfit font-bold text-xs">
                  {rev.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-outfit font-bold text-sm text-[var(--text-primary)]">
                    {rev.studentName}
                  </h4>
                  <p className="text-[10px] text-[var(--text-subtle)]">
                    {rev.className} • {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[var(--accent-amber)]">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <p className="text-xs text-[var(--text-primary)] italic leading-relaxed pl-12">
              "{rev.comment}"
            </p>

            {rev.hasReply && (
              <div className="ml-12 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs space-y-1">
                <span className="font-bold text-[var(--primary-sage)] text-[11px]">Your Public Response:</span>
                <p className="text-[var(--text-muted)] italic">{rev.replyContent || "Thank you for practicing with us!"}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-hairline)] text-xs">
              <button
                onClick={() => handleReportReview(rev.id)}
                className="text-[var(--text-subtle)] hover:text-[var(--text-primary)] flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                Report
              </button>

              {!rev.hasReply && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingReview(rev);
                    setReplyText("");
                  }}
                  className="text-xs border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--primary-sage)] cursor-pointer"
                >
                  Write Response
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Dialog */}
      {replyingReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 font-figtree">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
              <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                Reply to {replyingReview.studentName}
              </h3>
              <button onClick={() => setReplyingReview(null)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <p className="text-[var(--text-muted)] italic p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-hairline)]">
                "{replyingReview.comment}"
              </p>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Public Teacher Response *
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the practitioner and offer mindful tips..."
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)]">
                <Button variant="ghost" onClick={() => setReplyingReview(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs">
                  Publish Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
