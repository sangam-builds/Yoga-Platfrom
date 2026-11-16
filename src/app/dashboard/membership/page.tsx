"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Check,
  Sparkles,
  Share2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Pause,
  Play,
  RotateCcw,
  Tag,
  Receipt,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/dashboard/shared/Toast";
import { ConfirmDialog } from "@/components/dashboard/shared/ConfirmDialog";
import { PageHeader, StatusBadge, CopyButton } from "@/components/dashboard/shared/UIBlocks";
import { Pill } from "@/components/dashboard/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useRazorpayScript } from "@/components/checkout/useRazorpayScript";
import { PaymentResultModal, PaymentResultData } from "@/components/checkout/PaymentResultModal";

export default function MembershipPage() {
  const { formatCurrency, formatDate } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoaded: isRazorpayLoaded } = useRazorpayScript();

  const [billingInterval, setBillingInterval] = useState<"MONTH" | "YEAR">("MONTH");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmountPaise: number;
    description?: string | null;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Checkout & Modal States
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResultData | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Dialogs
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // 1. Fetch Current Subscription
  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["user-subscription"],
    queryFn: async () => {
      const res = await fetch("/api/me/subscription");
      if (!res.ok) throw new Error("Failed to load subscription");
      return res.json();
    },
  });

  // 2. Fetch Available Plans from DB
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["platform-plans"],
    queryFn: async () => {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      return res.json();
    },
  });

  // 3. Fetch Billing History
  const { data: billingData } = useQuery({
    queryKey: ["student-billing-history"],
    queryFn: async () => {
      const res = await fetch("/api/payments");
      if (!res.ok) throw new Error("Failed to load billing history");
      return res.json();
    },
  });

  // Validate Promo Code
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      // Find a plan to validate against
      const samplePlan = plansData?.plans?.[0]?.id;
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          planId: samplePlan || "default",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Invalid Promo Code", data.error || "Promo code is not recognized.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmountPaise: data.discountAmountPaise,
          description: data.description,
        });
        toast.success("Promo Code Applied", `Code ${data.code} applied to your checkout!`);
      }
    } catch (err: any) {
      toast.error("Error", "Could not validate promo code.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Trigger Razorpay Checkout
  const handleInitiateCheckout = async (plan: any) => {
    if (processingPlanId) return;

    if (!isRazorpayLoaded) {
      toast.error("Gateway Loading", "Please wait a moment while the secure payment gateway loads.");
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      // 1. Create order on server
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          promoCode: appliedCoupon?.code || undefined,
          billingInterval,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Checkout Failed", data.error || "Unable to initiate payment.");
        setProcessingPlanId(null);
        return;
      }

      // Handle 100% free discount activation
      if (data.isZeroCost) {
        toast.success("Activated", `${plan.name} has been activated!`);
        queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
        queryClient.invalidateQueries({ queryKey: ["student-billing-history"] });
        setProcessingPlanId(null);
        return;
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ZenFlow Yoga Studio",
        description: `Subscription: ${plan.name}`,
        order_id: data.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setPaymentResult({
            status: "PENDING",
            planName: plan.name,
            amountPaise: data.amount,
            receiptId: data.receipt,
          });
          setIsResultModalOpen(true);

          try {
            // 3. Verify signature on backend
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPaymentResult({
                status: "SUCCESS",
                planName: plan.name,
                amountPaise: data.amount,
                receiptId: data.receipt,
                paymentId: response.razorpay_payment_id,
              });

              // Invalidate caches so UI updates without reload
              queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
              queryClient.invalidateQueries({ queryKey: ["platform-plans"] });
              queryClient.invalidateQueries({ queryKey: ["student-billing-history"] });
              queryClient.invalidateQueries({ queryKey: ["user-stats"] });
            } else {
              setPaymentResult({
                status: "FAILED",
                errorMessage: verifyData.error || "Payment signature verification failed.",
              });
            }
          } catch (err: any) {
            setPaymentResult({
              status: "FAILED",
              errorMessage: "Could not contact server to verify payment.",
            });
          } finally {
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPlanId(null);
          },
        },
        prefill: {
          name: "ZenFlow Student",
          email: "student@zenflow.yoga",
        },
        theme: {
          color: "#47664A",
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on("payment.failed", (failedRes: any) => {
        setPaymentResult({
          status: "FAILED",
          errorMessage: failedRes.error?.description || "Payment failed or was declined.",
        });
        setIsResultModalOpen(true);
        setProcessingPlanId(null);
      });

      razorpayInstance.open();
    } catch (err: any) {
      toast.error("Error", "An unexpected error occurred during checkout.");
      setProcessingPlanId(null);
    }
  };

  const referralLink = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=YOGI2026` : "";
  const currentPlan = subData?.plan;
  const isTrial = subData?.status === "TRIALING";
  const isUnlimited = subData?.creditsRemaining === null || currentPlan?.credits === null;

  return (
    <div className="space-y-8 animate-in fade-in">
      <PageHeader
        title="Membership & Subscriptions"
        description="Choose the practice plan that aligns with your wellness goals. Manage active billing, credits, and perks."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Membership" }]}
      />

      {/* ─── 1. Current Active Plan Card ──────────────────────────────── */}
      <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-[var(--sage-tint)]/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-3 max-w-lg">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--sage-tint)] text-[var(--primary-sage)]">
              Current Plan
            </span>
            <Pill variant={subData?.status || "TRIALING"}>
              {(subData?.status || "TRIALING").toUpperCase()}
            </Pill>
          </div>

          <h2 className="font-outfit text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">
            {currentPlan?.name || "7-Day Free Trial"}
          </h2>

          <p className="font-figtree text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            {isTrial
              ? `Your free trial is active. Renews on ${formatDate(subData?.renewalDate || new Date())}.`
              : `Renews on ${formatDate(subData?.renewalDate || new Date())}. Full interactive HD live room and recorded replay access.`}
          </p>

          <div className="pt-2 flex items-center gap-6 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block">Available Credits</span>
              <span className="font-outfit font-bold text-base text-[var(--text-primary)]">
                {isUnlimited ? "Unlimited" : `${subData?.creditsRemaining ?? 5} classes`}
              </span>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]" />
            <div>
              <span className="text-[var(--text-muted)] block">Billing Cycle</span>
              <span className="font-outfit font-bold text-base text-[var(--text-primary)] capitalize">
                {currentPlan?.interval && currentPlan.interval !== "NONE" ? currentPlan.interval.toLowerCase() : "One-time"}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Actions */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <Button
            type="button"
            onClick={() => setIsPauseDialogOpen(true)}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors"
          >
            <Pause className="w-3.5 h-3.5 mr-1.5" />
            <span>Pause Subscription</span>
          </Button>

          <Button
            type="button"
            onClick={() => setIsCancelDialogOpen(true)}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold border border-[var(--negative-rose)]/20 bg-[var(--negative-rose)]/10 text-[var(--negative-rose)] hover:bg-[var(--negative-rose)]/15 transition-colors"
          >
            <span>Cancel Plan</span>
          </Button>
        </div>
      </div>

      {/* ─── 2. Plan Comparison & Checkout ───────────────────────────── */}
      <div className="space-y-6" id="plans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-outfit text-xl font-semibold text-[var(--text-primary)]">
              Choose Your Practice Commitment
            </h3>
            <p className="font-figtree text-xs text-[var(--text-muted)] mt-0.5">
              Switch anytime. Prorated credits apply automatically to upgrades.
            </p>
          </div>

          {/* Billing Interval Toggle (Monthly / Annual with savings badge) */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl text-xs font-semibold self-start">
            <button
              type="button"
              onClick={() => setBillingInterval("MONTH")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                billingInterval === "MONTH"
                  ? "bg-[var(--primary-sage)] text-white shadow-xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval("YEAR")}
              className={`px-3.5 py-1.5 rounded-lg transition-all inline-flex items-center gap-1.5 ${
                billingInterval === "YEAR"
                  ? "bg-[var(--primary-sage)] text-white shadow-xs font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-md bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] text-[10px] font-bold">
                Save 28%
              </span>
            </button>
          </div>
        </div>

        {/* Coupon Code Input */}
        <div className="max-w-md flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Promo code (e.g. FLOW20 for 20% off)"
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary-sage)]"
            />
          </div>
          <Button
            type="button"
            disabled={isApplyingCoupon || !couponCode.trim()}
            onClick={handleValidateCoupon}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-canvas)] text-[var(--text-primary)]"
          >
            {isApplyingCoupon ? "Applying..." : "Apply Code"}
          </Button>
        </div>

        {appliedCoupon && (
          <div className="text-xs text-[var(--primary-sage)] font-medium flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>Code <strong>{appliedCoupon.code}</strong> applied: -₹{(appliedCoupon.discountAmountPaise / 100).toFixed(0)}</span>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansData?.plans?.map((plan: any) => {
            const isAnnual = plan.interval === "YEAR";
            const isMonthly = plan.interval === "MONTH";
            if (billingInterval === "MONTH" && isAnnual) return null;
            if (billingInterval === "YEAR" && isMonthly) return null;

            const isCurrentPlan = currentPlan?.id === plan.id;
            let displayPrice = plan.priceInr;

            // If coupon applied
            if (appliedCoupon) {
              displayPrice = Math.max(0, displayPrice - appliedCoupon.discountAmountPaise);
            }

            const isProcessing = processingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-[24px] bg-[var(--bg-surface)] border transition-all flex flex-col justify-between space-y-6 ${
                  plan.type === "SUBSCRIPTION"
                    ? "border-[var(--primary-sage)] shadow-sm ring-1 ring-[var(--primary-sage)]/20"
                    : "border-[var(--border-subtle)]"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-outfit text-xl font-bold text-[var(--text-primary)]">
                      {plan.name}
                    </h4>
                    {plan.type === "SUBSCRIPTION" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--sage-tint)] text-[var(--primary-sage)]">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-outfit text-3xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(displayPrice / 100)}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] ml-1">
                      /{plan.interval === "YEAR" ? "year" : plan.interval === "MONTH" ? "month" : "one-time"}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-[var(--text-muted)]">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[var(--primary-sage)] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  type="button"
                  disabled={isCurrentPlan || isProcessing}
                  onClick={() => handleInitiateCheckout(plan)}
                  className={`w-full rounded-xl py-3 text-xs font-bold transition-all shadow-xs ${
                    isCurrentPlan
                      ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-subtle)]"
                      : "bg-[var(--primary-sage)] text-white hover:opacity-90"
                  }`}
                >
                  {isCurrentPlan ? (
                    "Current Plan"
                  ) : isProcessing ? (
                    "Connecting Gateway..."
                  ) : plan.priceInr === 0 ? (
                    "Start Free Trial"
                  ) : (
                    "Upgrade to Plan"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 3. Billing & Payment History Table ────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--sage-tint)] text-[var(--primary-sage)] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-outfit text-lg font-bold text-[var(--text-primary)]">
                Billing & Transaction History
              </h3>
              <p className="font-figtree text-xs text-[var(--text-muted)]">
                Verified payment receipts, card and UPI transactions.
              </p>
            </div>
          </div>
        </div>

        {billingData?.payments && billingData.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Order / Receipt ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {billingData.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-canvas)] transition-colors">
                    <td className="py-3.5 px-3 font-medium text-[var(--text-primary)]">
                      {formatDate(p.paidAt || p.createdAt)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[var(--text-primary)]">
                      {p.planName}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[var(--text-primary)]">
                      {formatCurrency(p.amount / 100)}
                    </td>
                    <td className="py-3.5 px-3 uppercase text-[11px] text-[var(--text-muted)]">
                      {p.method || "card"}
                    </td>
                    <td className="py-3.5 px-3">
                      <Pill variant={p.status}>{p.status}</Pill>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[10px] text-[var(--text-muted)]">
                      {p.providerOrderId || p.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No previous billing records found. Your invoices will appear here once confirmed.
          </div>
        )}
      </div>

      {/* ─── 4. Referral Panel ────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--sage-tint)] flex items-center justify-center text-[var(--primary-sage)]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-lg font-bold text-[var(--text-primary)]">
              Invite a Friend, Practice Together
            </h3>
            <p className="font-figtree text-xs text-[var(--text-muted)]">
              Share your invite link. When your friend joins their first class, you both receive 2 bonus class credits!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full sm:flex-1 text-xs font-mono p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] select-all"
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

      {/* Cancel Plan Modal */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={() => {
          setIsCancelDialogOpen(false);
          toast.info("Subscription Scheduled for Cancellation", "Access continues until the end of your billing period.");
        }}
        title="Cancel Membership Renewal?"
        description="Are you sure? You will retain access until the end of your current billing period, after which class bookings will pause."
        confirmLabel="Confirm Cancellation"
        cancelLabel="Keep Membership"
        isDestructive={true}
      />

      {/* Payment Result Modal */}
      <PaymentResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        data={paymentResult}
        onRetry={() => {
          if (processingPlanId) {
            const plan = plansData?.plans?.find((p: any) => p.id === processingPlanId);
            if (plan) handleInitiateCheckout(plan);
          }
        }}
      />
    </div>
  );
}
