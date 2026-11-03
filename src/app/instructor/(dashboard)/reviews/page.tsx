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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B8F71] font-semibold">
            Practitioner Feedback & Sentiment
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233D32]">
            Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Read verified student feedback, post public instructor responses, or flag inappropriate reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-[#E9E2D0] shadow-2xs text-xs font-mono">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span className="font-bold text-stone-900 text-sm">4.9</span>
          <span className="text-stone-400">/ 5.0 (42 reviews)</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev: any) => (
          <div
            key={rev.id}
            className="bg-white p-5 rounded-2xl border border-[#E9E2D0] shadow-xs space-y-3 hover:border-[#6B8F71]/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6B8F71]/20 text-[#233D32] flex items-center justify-center font-bold text-xs">
                  {rev.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#233D32]">
                    {rev.studentName}
                  </h4>
                  <p className="text-[10px] font-mono text-stone-400">
                    {rev.className} • {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <p className="text-xs text-stone-700 italic leading-relaxed pl-12">
              "{rev.comment}"
            </p>

            {rev.hasReply && (
              <div className="ml-12 p-3 rounded-xl bg-[#F8F7F2] border border-[#E9E2D0] text-xs space-y-1">
                <span className="font-bold text-[#6B8F71] text-[11px]">Your Public Response:</span>
                <p className="text-stone-700 italic">{rev.replyContent || "Thank you for practicing with us!"}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100 text-xs">
              <button
                onClick={() => handleReportReview(rev.id)}
                className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-[11px]"
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
                  className="text-xs border-[#E9E2D0] hover:border-[#6B8F71]"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E9E2D0] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#E9E2D0]">
              <h3 className="font-serif font-bold text-base text-[#233D32]">
                Reply to {replyingReview.studentName}
              </h3>
              <button onClick={() => setReplyingReview(null)} className="p-1 text-stone-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3 text-xs">
              <p className="text-stone-500 italic p-3 bg-[#F8F7F2] rounded-xl border border-[#E9E2D0]">
                "{replyingReview.comment}"
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Public Teacher Response *
                </label>
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank the practitioner and offer mindful tips..."
                  className="w-full px-3 py-2 border border-[#E9E2D0] rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9E2D0]">
                <Button variant="ghost" onClick={() => setReplyingReview(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#6B8F71] hover:bg-[#58775D] text-white">
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
