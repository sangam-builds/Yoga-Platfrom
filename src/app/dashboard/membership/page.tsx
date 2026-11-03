"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Check,
  Sparkles,
  Gift,
  Share2,
  Copy,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { PageHeader, StatusBadge, ProgressBar, CopyButton } from "@/components/dashboard/shared/UIBlocks";
import { Button } from "@/components/ui/Button";

export default function MembershipPage() {
  const { t, formatCurrency, formatDate } = useI18n();
  const { toast } = useToast();

  const [billingInterval, setBillingInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Fetch Current Subscription
  const { data: subData } = useQuery({
    queryKey: ["user-subscription"],
    queryFn: async () => {
      const res = await fetch("/api/me/subscription");
      if (!res.ok) throw new Error("Failed to load subscription");
      return res.json();
    },
  });

  // Fetch Available Plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["platform-plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      return res.json();
    },
  });

  const handleValidateCoupon = () => {
    if (couponCode.trim().toUpperCase() === "FLOW20") {
      setDiscountPercent(20);
      toast.success("Coupon Applied!", "20% discount applied to your checkout.");
    } else if (couponCode.trim()) {
      toast.error("Invalid Coupon", "The entered promo code is not recognized.");
    }
  };

  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=YOGI2026` : "";

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Membership & Subscriptions"
        description="Choose the practice plan that aligns with your wellness goals. Manage active billing, credits, and perks."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Membership" }]}
      />

      {/* ─── 1. Current Active Plan Card ──────────────────────────────── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#233D32] to-[#162720] text-white p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6B8F71] text-white">
              Current Plan
            </span>
            <StatusBadge status={subData?.status || "ACTIVE"} />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            {subData?.plan?.name || "7-Day Free Trial"}
          </h2>

          <p className="text-xs text-white/80 leading-relaxed">
            Renews on {formatDate(subData?.renewalDate || new Date())} • Unlimited access to interactive HD live rooms and masterclasses.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs">
            <div>
              <span className="text-white/60 block">Credits Available</span>
              <span className="font-bold text-base">{subData?.creditsRemaining ?? 5} classes</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-white/60 block">Billing Cycle</span>
              <span className="font-bold text-base capitalize">{subData?.plan?.interval || "Monthly"}</span>
            </div>
          </div>
        </div>

        {/* Plan Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => setIsPauseDialogOpen(true)}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            <Pause className="w-3.5 h-3.5 mr-1.5" />
            <span>Pause Subscription</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsCancelDialogOpen(true)}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30"
          >
            <span>Cancel Plan</span>
          </Button>
        </div>
      </div>

      {/* ─── 2. Plan Comparison & Checkout ───────────────────────────── */}
      <div className="space-y-6" id="plans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
              Choose Your Practice Commitment
            </h3>
            <p className="text-xs text-gray-500">
              Switch anytime. Prorated credits apply automatically to upgrades.
            </p>
          </div>

          {/* Billing Interval Toggle (Monthly / Annual with savings badge) */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold self-start">
            <button
              type="button"
              onClick={() => setBillingInterval("MONTH")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                billingInterval === "MONTH"
                  ? "bg-[#233D32] text-white dark:bg-[#6B8F71] dark:text-gray-950 font-bold"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("YEAR")}
              className={`px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                billingInterval === "YEAR"
                  ? "bg-[#233D32] text-white dark:bg-[#6B8F71] dark:text-gray-950 font-bold"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                Save 28%
              </span>
            </button>
          </div>
        </div>

        {/* Coupon Code Input */}
        <div className="max-w-md flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onBlur={handleValidateCoupon}
            placeholder="Promo code (e.g. FLOW20 for 20% off)"
            className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6B8F71]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleValidateCoupon}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
          >
            Apply Code
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansData?.plans?.map((plan: any) => {
            const isAnnual = plan.interval === "YEAR";
            const isMonthly = plan.interval === "MONTH";
            if (billingInterval === "MONTH" && isAnnual) return null;
            if (billingInterval === "YEAR" && isMonthly) return null;

            let price = plan.priceInr;
            if (discountPercent) {
              price = Math.round(price * (1 - discountPercent / 100));
            }

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-3xl bg-white dark:bg-gray-900 border transition-all flex flex-col justify-between space-y-6 ${
                  plan.type === "SUBSCRIPTION"
                    ? "border-[#6B8F71] shadow-md ring-1 ring-[#6B8F71]/30"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h4>
                    {plan.type === "SUBSCRIPTION" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E9E2D0] text-[#233D32]">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      /{plan.interval === "YEAR" ? "year" : plan.interval === "MONTH" ? "month" : "one-time"}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#6B8F71] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="button"
                  onClick={() => toast.success("Checkout Initiated", `Processing subscription for ${plan.name}...`)}
                  className="w-full rounded-xl py-2.5 text-xs font-bold bg-[#233D32] hover:bg-[#6B8F71] text-white shadow-xs"
                >
                  {plan.priceInr === 0 ? "Start Free Trial" : "Upgrade to Plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. Referral Panel (Section 6.9) ─────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
              Invite a Friend, Practice Together
            </h3>
            <p className="text-xs text-gray-500">
              Share your invite link. When your friend joins their first class, you both receive 2 bonus class credits!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full sm:flex-1 text-xs font-mono p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 select-all"
          />
          <CopyButton text={referralLink} label="Copy Link" />
        </div>
      </div>

      {/* Pause Subscription Modal */}
      <ConfirmDialog
        isOpen={isPauseDialogOpen}
        onClose={() => setIsPauseDialogOpen(false)}
        onConfirm={() => {
          setIsPauseDialogOpen(false);
          toast.success("Subscription Paused", "You can resume at any time without losing your credits.");
        }}
        title="Pause Yoga Membership?"
        description="Pausing freezes your billing cycle and prevents future renewals until you resume. Any existing future bookings will be cancelled and your credits preserved."
        confirmLabel="Pause Subscription"
        cancelLabel="Keep Active"
      />

      {/* Cancel Plan Modal (3-Step flow) */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={() => {
          setIsCancelDialogOpen(false);
          toast.info("Subscription Scheduled for Cancellation", "Access continues until the end of your billing period.");
        }}
        title="Cancel Membership Renewal?"
        description="Are you sure? You will retain access until the end of your current billing period, after which class bookings will pause. Would you prefer pausing for 30 days instead?"
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Membership"
        isDestructive={true}
      />
    </div>
  );
}
