"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  CreditCard,
  Download,
  Calendar,
  Lock,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function InstructorEarningsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [accountType, setAccountType] = useState<"BANK_ACCOUNT" | "UPI">("BANK_ACCOUNT");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [stepUpPasscode, setStepUpPasscode] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-earnings"],
    queryFn: async () => {
      const res = await fetch("/api/instructor/earnings");
      if (!res.ok) throw new Error("Failed to load earnings");
      return res.json();
    },
  });

  const updatePayoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/instructor/payout-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountHolderName: accountHolder,
          accountType,
          bankName,
          accountNumber,
          ifscCode,
          upiId,
          passcode: stepUpPasscode,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to update payout details");
      return d;
    },
    onSuccess: (resData) => {
      toast.success("Payout destination verified and updated.");
      queryClient.invalidateQueries({ queryKey: ["instructor-earnings"] });
      setIsPayoutModalOpen(false);
      setStepUpPasscode("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const summary = data?.summary || {
    thisMonth: 38500,
    lastMonth: 32400,
    yearToDate: 184500,
    pendingPayout: 38500,
    revenueSharePercent: 50,
    payoutSchedule: "Monthly on the 1st",
    payoutDetailsMasked: "HDFC Bank •••• 4821 (IFSC: HDFC0001234)",
  };

  const sessions = data?.sessions || [];
  const payouts = data?.payouts || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDownloadCsv = () => {
    const headers = "Session Date,Class Title,Attended Students,RevShare %,Net Earnings (INR)\n";
    const rows = sessions
      .map(
        (s: any) =>
          `"${new Date(s.date).toLocaleDateString()}","${s.classTitle}","${s.attendanceCount}","${s.revSharePercent}%","${s.amount}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `earnings_statement_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Earnings statement CSV downloaded.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-hairline)]">
        <div>
          <span className="text-[11px] font-outfit uppercase tracking-widest text-[var(--primary-sage)] font-bold">
            Automated Settlement & RevShare
          </span>
          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Earnings & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-figtree">
            Monthly teaching revenue share is computed directly from verified session attendance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCsv}
            className="text-xs gap-1.5 border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            Download Statement (.CSV)
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPayoutModalOpen(true)}
            className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[var(--on-primary)]" />
            Payout Destination
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--primary-sage)] text-[var(--on-primary)] p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[var(--on-primary)]/80">
            <span className="text-xs font-figtree font-medium">Estimated This Month</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="font-outfit text-2xl sm:text-3xl font-bold text-white">
            {formatCurrency(summary.thisMonth)}
          </div>
          <p className="text-[11px] text-[var(--on-primary)]/80 font-figtree">
            Based on {summary.revenueSharePercent}% RevShare policy
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Last Month Paid</span>
            <CheckCircle className="w-4 h-4 text-[var(--primary-sage)]" />
          </div>
          <div className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {formatCurrency(summary.lastMonth)}
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">Settled automatically</p>
        </div>

        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Year to Date (YTD)</span>
            <TrendingUp className="w-4 h-4 text-[var(--primary-sage)]" />
          </div>
          <div className="font-outfit text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {formatCurrency(summary.yearToDate)}
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">Cumulative earnings</p>
        </div>

        <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-figtree font-medium">Payout Account</span>
            <ShieldCheck className="w-4 h-4 text-[var(--info-teal)]" />
          </div>
          <div className="text-xs font-mono font-bold text-[var(--text-primary)] truncate">
            {summary.payoutDetailsMasked || "Not Configured"}
          </div>
          <p className="text-[11px] text-[var(--text-subtle)] font-figtree">AES-256 encrypted & masked</p>
        </div>
      </div>

      {/* Session Earnings Breakdown (Section 5.9 of Spec) */}
      <div className="bg-[var(--bg-surface)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-2xs space-y-4 font-figtree">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--primary-sage)]" />
            Session Breakdown (This Month)
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Server computed: attendance × base rate × {summary.revenueSharePercent}%
          </span>
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] italic p-6 text-center">
            No completed sessions recorded yet for this billing cycle.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)] border-b border-[var(--border-hairline)] font-outfit text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Attended Students</th>
                  <th className="py-3 px-4">RevShare %</th>
                  <th className="py-3 px-4 text-right">Instructor Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {sessions.map((item: any) => (
                  <tr key={item.id} className="hover:bg-[var(--bg-elevated)]/50 transition-colors">
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--text-primary)]">
                      {item.classTitle}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[var(--primary-sage)]">
                      {item.attendanceCount} practitioners
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {item.revSharePercent}%
                    </td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)] text-right">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Details Step-Up Modal (Rule 7 of Spec) */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-[var(--border-subtle)] shadow-2xl animate-in zoom-in-95 font-figtree">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-amber-tint)] text-[var(--accent-amber)] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">
                  Update Payout Destination
                </h3>
              </div>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePayoutMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("BANK_ACCOUNT")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      accountType === "BANK_ACCOUNT"
                        ? "bg-[var(--sage-tint)] border-[var(--primary-sage)] text-[var(--primary-sage)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    Direct Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("UPI")}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                      accountType === "UPI"
                        ? "bg-[var(--sage-tint)] border-[var(--primary-sage)] text-[var(--primary-sage)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    UPI ID
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-primary)] mb-1">
                  Account Holder Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="As registered with your bank"
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
                />
              </div>

              {accountType === "BANK_ACCOUNT" ? (
                <>
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      Account Number *
                    </label>
                    <input
                      type="password"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter full bank account number"
                      className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs font-mono outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    UPI ID (Virtual Payment Address) *
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@okhdfcbank"
                    className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              )}

              {/* Step-up Re-Authentication Passcode (Rule 7 & Page 12) */}
              <div className="p-3.5 rounded-2xl bg-[var(--accent-amber-tint)] border border-[var(--accent-amber)]/30 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[var(--accent-amber)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-amber)]" />
                  Step-Up Authentication
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  To protect against unauthorized diversion of teacher funds, enter your account password or step-up authorization code:
                </p>
                <input
                  type="password"
                  required
                  value={stepUpPasscode}
                  onChange={(e) => setStepUpPasscode(e.target.value)}
                  placeholder="Enter current password to authorize..."
                  className="w-full px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-hairline)]">
                <Button variant="ghost" onClick={() => setIsPayoutModalOpen(false)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updatePayoutMutation.isPending || !stepUpPasscode}
                  className="bg-[var(--primary-sage)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs cursor-pointer shadow-xs"
                >
                  {updatePayoutMutation.isPending ? "Encrypting & Saving..." : "Confirm & Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
