"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle2,
  X,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Pill } from "@/components/dashboard/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundAmountRupees, setRefundAmountRupees] = useState<string>("");
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  // 15-second polling query for real-time payments reflection
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["admin-payments-list", page, statusFilter, methodFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        status: statusFilter,
        method: methodFilter,
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load payments");
      return res.json();
    },
    refetchInterval: 15_000,
  });

  const handleExportCsv = () => {
    const params = new URLSearchParams({
      export: "csv",
      status: statusFilter,
      method: methodFilter,
    });
    if (search.trim()) params.set("search", search.trim());
    window.open(`/api/admin/payments?${params.toString()}`, "_blank");
  };

  const handleOpenRefund = (payment: any) => {
    setSelectedPayment(payment);
    const refundablePaise = payment.amount - (payment.refunds?.reduce((s: number, r: any) => s + r.amount, 0) || 0);
    setRefundAmountRupees((refundablePaise / 100).toFixed(0));
    setRefundReason("");
    setIsRefundModalOpen(true);
  };

  const handleExecuteRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const amountRupees = Number(refundAmountRupees);
    if (!amountRupees || amountRupees <= 0) {
      toast.error("Invalid Amount", "Please enter a valid refund amount.");
      return;
    }
    if (!refundReason.trim()) {
      toast.error("Reason Required", "Please provide a reason for the refund.");
      return;
    }

    setIsRefunding(true);
    try {
      const res = await fetch(`/api/admin/payments/${selectedPayment.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amountRupees * 100),
          reason: refundReason.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        toast.error("Refund Failed", resData.error || "Could not process refund.");
      } else {
        toast.success("Refund Processed", `₹${amountRupees} refund issued via Razorpay.`);
        setIsRefundModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-payments-list"] });
        queryClient.invalidateQueries({ queryKey: ["admin-kpis-overview"] });
        setSelectedPayment(null);
      }
    } catch {
      toast.error("Error", "Unexpected error executing refund.");
    } finally {
      setIsRefunding(false);
    }
  };

  const formatRupees = (paise?: number) => {
    if (!paise) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Test Mode Notification Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>TEST PAYMENTS ONLY:</strong> Razorpay Test Mode is active. No real funds are moved.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] opacity-75">Auto-refresh: 15s</span>
          {isRefetching && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
        </div>
      </div>

      <PageHeader
        title="Payments & Refunds"
        description="Comprehensive transaction ledger with real-time Razorpay order IDs, payment methods, and administrative refund controls."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
        action={
          <Button
            type="button"
            onClick={handleExportCsv}
            variant="outline"
            className="rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or order/payment ID..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-[#47664A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="PARTIALLY_REFUNDED">Partially Refunded</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium"
          >
            <option value="ALL">All Methods</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Netbanking</option>
            <option value="wallet">Wallet</option>
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="rounded-xl px-3 py-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Gateway IDs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Loading payments ledger...
                  </td>
                </tr>
              ) : data?.payments?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                data?.payments?.map((payment: any) => {
                  const d = new Date(payment.createdAt);
                  const formattedDate = d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = d.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formattedDate}
                        </div>
                        <div className="text-[11px] text-gray-400">{formattedTime}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {payment.user?.name || "Student"}
                        </div>
                        <div className="text-[11px] text-gray-400">{payment.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        {payment.plan?.name || "Membership"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                        {formatRupees(payment.amount)}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-gray-500">
                        {payment.method || "card"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Pill variant={payment.status}>{payment.status}</Pill>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                        <div>O: {payment.providerOrderId?.slice(0, 16) || "—"}</div>
                        <div>P: {payment.providerPaymentId?.slice(0, 16) || "—"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(payment)}
                          className="text-[11px] font-semibold text-[#47664A] hover:underline"
                        >
                          Details
                        </button>
                        {(payment.status === "SUCCEEDED" || payment.status === "PARTIALLY_REFUNDED") && (
                          <button
                            type="button"
                            onClick={() => handleOpenRefund(payment)}
                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <div>
            Total: <strong>{data?.pagination?.totalCount || 0}</strong> transactions
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="outline"
              className="rounded-lg px-2.5 py-1 text-xs"
            >
              Previous
            </Button>
            <span className="px-2 font-semibold text-gray-900 dark:text-white">
              {page} of {data?.pagination?.totalPages || 1}
            </span>
            <Button
              type="button"
              disabled={page >= (data?.pagination?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
              className="rounded-lg px-2.5 py-1 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Detail Drawer / Modal */}
      {selectedPayment && !isRefundModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setSelectedPayment(null)}
              className="absolute top-4 right-4 p-1 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E1EDDD] text-[#47664A] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-outfit text-lg font-bold text-gray-900 dark:text-white">
                  Payment Detail
                </h3>
                <p className="font-mono text-xs text-gray-400">{selectedPayment.id}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedPayment.user?.name} ({selectedPayment.user?.email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedPayment.plan?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gross Amount</span>
                <span className="font-bold text-[#47664A]">
                  {formatRupees(selectedPayment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status</span>
                <Pill variant={selectedPayment.status}>{selectedPayment.status}</Pill>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Razorpay Order ID</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {selectedPayment.providerOrderId || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Razorpay Payment ID</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {selectedPayment.providerPaymentId || "—"}
                </span>
              </div>
            </div>

            {selectedPayment.refunds && selectedPayment.refunds.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-rose-600">
                  Refund History
                </h4>
                {selectedPayment.refunds.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 flex justify-between"
                  >
                    <span>{formatRupees(r.amount)}</span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {r.providerRefundId || r.id}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPayment(null)}
                className="rounded-xl px-4 py-2 text-xs"
              >
                Close
              </Button>
              {(selectedPayment.status === "SUCCEEDED" ||
                selectedPayment.status === "PARTIALLY_REFUNDED") && (
                <Button
                  type="button"
                  onClick={() => handleOpenRefund(selectedPayment)}
                  className="rounded-xl px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Issue Refund
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refund Execution Modal */}
      {isRefundModalOpen && selectedPayment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
                  Issue Gateway Refund
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedPayment.plan?.name} • {selectedPayment.user?.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteRefund} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Refund Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={refundAmountRupees}
                  onChange={(e) => setRefundAmountRupees(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Audit Reason for Refund
                </label>
                <textarea
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Student requested class schedule cancellation within policy..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isRefunding}
                  className="rounded-xl px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isRefunding ? "Processing Refund..." : "Confirm Refund"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
