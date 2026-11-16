"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";

export interface TestPaymentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    amount: number;
    currency: string;
    planName: string;
    receipt?: string;
  } | null;
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onError: (errorMessage: string) => void;
}

export function TestPaymentSimulatorModal({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onError,
}: TestPaymentSimulatorModalProps) {
  const [activeTab, setActiveTab] = useState<"card" | "upi" | "fail">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !orderData) return null;

  const formattedAmount = (orderData.amount / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: orderData.currency || "INR",
    maximumFractionDigits: 0,
  });

  const handleSimulateCardSuccess = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: `sig_test_${Date.now()}`,
      });
      onClose();
    }, 600);
  };

  const handleSimulateUpiSuccess = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: `sig_test_${Date.now()}`,
      });
      onClose();
    }, 600);
  };

  const handleSimulateFailure = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onError("Payment was declined by user or test issuer bank.");
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#D1DBCF] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#29352F]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E4DFD3] flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E1EDDD] text-[#47664A] flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-outfit font-semibold text-sm sm:text-base text-[#29352F]">
                  Razorpay Test Gateway
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Sandbox
                </span>
              </div>
              <p className="font-figtree text-xs text-[#6C7B72]">
                Official Test Mode Simulator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6C7B72] hover:text-[#29352F] p-1.5 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Plan Banner */}
        <div className="px-5 py-4 bg-[#FAF6EF]/60 border-b border-[#E4DFD3] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#47664A]">
              Subscribing To
            </span>
            <div className="font-outfit font-semibold text-sm text-[#29352F]">
              {orderData.planName}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#6C7B72]">Amount Due</span>
            <div className="font-outfit font-bold text-lg text-[#29352F]">
              {formattedAmount}
            </div>
          </div>
        </div>

        {/* Instrument Tabs */}
        <div className="p-5 space-y-4">
          <div className="flex p-1 bg-[#FAF6EE] rounded-xl border border-[#E4DFD3] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("card")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "card"
                  ? "bg-white text-[#47664A] shadow-xs font-semibold"
                  : "text-[#6C7B72] hover:text-[#29352F]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Test Card</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upi")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "upi"
                  ? "bg-white text-[#47664A] shadow-xs font-semibold"
                  : "text-[#6C7B72] hover:text-[#29352F]"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Test UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fail")}
              className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "fail"
                  ? "bg-white text-rose-700 shadow-xs font-semibold"
                  : "text-[#6C7B72] hover:text-[#29352F]"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Simulate Decline</span>
            </button>
          </div>

          {/* Tab 1: Test Card */}
          {activeTab === "card" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#FAF6EE] border border-[#E4DFD3] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#6C7B72]">
                  <span>Test Card Number:</span>
                  <span className="font-mono font-semibold text-[#29352F]">
                    4100 2800 0000 1007
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#6C7B72]">
                  <span>Expiry & CVV:</span>
                  <span className="font-mono font-semibold text-[#29352F]">
                    12 / 30 &nbsp;•&nbsp; 123
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#6C7B72]">
                  <span>Scenario:</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Domestic Card Success
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSimulateCardSuccess}
                className="w-full py-3 px-4 rounded-xl bg-[#47664A] hover:bg-[#3D573F] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay {formattedAmount} with Test Card</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: Test UPI */}
          {activeTab === "upi" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-[#FAF6EE] border border-[#E4DFD3] rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#6C7B72]">
                  <span>Virtual Payment Address:</span>
                  <span className="font-mono font-semibold text-[#29352F]">
                    success@razorpay
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#6C7B72]">
                  <span>Scenario:</span>
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant UPI Auto-Approval
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSimulateUpiSuccess}
                className="w-full py-3 px-4 rounded-xl bg-[#47664A] hover:bg-[#3D573F] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing UPI...</span>
                  </>
                ) : (
                  <>
                    <span>Pay {formattedAmount} with Test UPI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 3: Simulate Failure */}
          {activeTab === "fail" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-800">
                <p>
                  Simulates a 3D-Secure bank decline or cancelled checkout session. Verifies that no subscription or charge is made.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSimulateFailure}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Trigger Failed Payment Scenario</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E4DFD3] bg-[#FAF6EE] flex items-center justify-between text-[11px] text-[#6C7B72]">
          <span>Order ID: <code className="font-mono text-[10px] text-[#29352F]">{orderData.orderId.slice(0, 16)}...</code></span>
          <button
            type="button"
            onClick={onClose}
            className="hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
