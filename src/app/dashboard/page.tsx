"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { OverviewHeader } from "@/components/dashboard/overview/OverviewHeader";
import { NextClassHeroCard } from "@/components/dashboard/overview/NextClassHeroCard";
import { MembershipCard } from "@/components/dashboard/overview/MembershipCard";
import { OverviewStatsRow } from "@/components/dashboard/overview/OverviewStatsRow";
import { AttendanceSummaryCard } from "@/components/dashboard/overview/AttendanceSummaryCard";
import { NextCertificateCard } from "@/components/dashboard/overview/NextCertificateCard";
import { RecentAchievementsCard } from "@/components/dashboard/overview/RecentAchievementsCard";
import { QuickActions } from "@/components/dashboard/overview/QuickActions";

export default function DashboardOverviewPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  // 1. User & Profile
  const { data: userData } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to load user");
      return res.json();
    },
  });

  // 2. Stats
  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await fetch("/api/me/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
  });

  // 3. Subscription
  const { data: subData } = useQuery({
    queryKey: ["user-subscription"],
    queryFn: async () => {
      const res = await fetch("/api/me/subscription");
      if (!res.ok) throw new Error("Failed to load subscription");
      return res.json();
    },
  });

  // 4. Upcoming Bookings
  const { data: bookingsData } = useQuery({
    queryKey: ["user-bookings-upcoming"],
    queryFn: async () => {
      const res = await fetch("/api/me/bookings?status=upcoming");
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
  });

  // Cancel Booking Mutation with optimistic updates
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");
      return data;
    },
    onSuccess: (data) => {
      toast.success("Booking cancelled", data.message || "Your credit has been restored to your balance.");
      queryClient.invalidateQueries({ queryKey: ["user-bookings-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
      setCancelBookingId(null);
    },
    onError: (err: any) => {
      toast.error("Cancellation failed", err.message);
    },
  });

  const user = userData?.user;
  const nextBooking = bookingsData?.bookings?.[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in select-none">
      {/* ─── 1. Greeting Header ───────────────────────────────────────── */}
      <OverviewHeader name={user?.name} streakDays={statsData?.streakDays} />

      {/* ─── 2. Row 1: Next Class Hero + Membership & Credits ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <NextClassHeroCard
          booking={nextBooking}
          onCancelBooking={(id) => setCancelBookingId(id)}
          className="lg:col-span-7"
        />
        <MembershipCard
          subscription={subData?.subscription}
          className="lg:col-span-5"
        />
      </div>

      {/* ─── 3. Row 2: 4 Key Metric Cards ─────────────────────────────── */}
      <OverviewStatsRow stats={statsData} />

      {/* ─── 4. Row 3: Consistency Heatmap & Certification Milestone ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <AttendanceSummaryCard className="lg:col-span-7" />
        <NextCertificateCard className="lg:col-span-5" />
      </div>

      {/* ─── 5. Row 4: Recent Achievements & Badges ───────────────────── */}
      <RecentAchievementsCard />

      {/* ─── 6. Row 5: Quick Action Tiles ─────────────────────────────── */}
      <QuickActions />

      {/* ─── Cancellation Confirmation Dialog ─────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(cancelBookingId)}
        title="Cancel Session Booking"
        description="Are you sure you want to cancel this booking? If cancelled at least 2 hours before class, your credit will be immediately refunded."
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Booking"
        isDestructive
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (cancelBookingId) cancelMutation.mutate(cancelBookingId);
        }}
        onClose={() => setCancelBookingId(null)}
      />
    </div>
  );
}
