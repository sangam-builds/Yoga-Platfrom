"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Clock,
  CheckCircle2,
  X,
  Code,
  Radio,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Pill } from "@/components/dashboard/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/dashboard/shared/Toast";
import { useI18n } from "@/lib/i18n";

export default function AdminHealthPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatDate } = useI18n();

  const [selectedPayload, setSelectedPayload] = useState<any | null>(null);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-webhook-health"],
    queryFn: async () => {
      const res = await fetch("/api/admin/health/webhooks");
      if (!res.ok) throw new Error("Failed to load webhook health telemetry");
      return res.json();
    },
    refetchInterval: 15_000,
  });

  const handleReplay = async (webhookId: string) => {
    setReplayingId(webhookId);
    try {
      const res = await fetch(`/api/admin/health/webhooks/${webhookId}/replay`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) {
        toast.error("Replay Failed", resData.error || "Could not replay webhook event.");
      } else {
        toast.success("Event Replayed", "Webhook event reprocessed successfully.");
        queryClient.invalidateQueries({ queryKey: ["admin-webhook-health"] });
        queryClient.invalidateQueries({ queryKey: ["admin-payments-list"] });
      }
    } catch {
      toast.error("Error", "Unexpected failure during replay.");
    } finally {
      setReplayingId(null);
    }
  };

  const gateway = data?.gateway;

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="System Health & Webhook Telemetry"
        description="Monitor real-time payment gateway webhooks, SLA delivery intervals, failure logs, and manual event replay tools."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Health & Telemetry" }]}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </Button>
        }
      />

      {/* ── Gateway Health Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gateway Mode */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Gateway Mode
          </span>
          <div className="flex items-center justify-between">
            <span className="font-outfit text-2xl font-bold text-gray-900 dark:text-white">
              {gateway?.mode || "TEST"}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {gateway?.provider || "Razorpay"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            {gateway?.mode === "TEST" ? "Active with test keys (no real funds charged)" : "Live production keys active"}
          </p>
        </div>

        {/* Operational Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Webhook Health Status
          </span>
          <div className="flex items-center justify-between">
            <span className="font-outfit text-2xl font-bold capitalize text-gray-900 dark:text-white">
              {gateway?.status || "Healthy"}
            </span>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-gray-400">
            SLA target: 99.9% delivery within 500ms
          </p>
        </div>

        {/* 24h Failed Events */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Failed Events (24h)
          </span>
          <div className="font-outfit text-2xl font-bold text-gray-900 dark:text-white">
            {gateway?.failedEvents24h ?? 0}
          </div>
          <p className="text-[11px] text-gray-400">
            Events rejected or timed out
          </p>
        </div>

        {/* Stuck Pending Payments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Stuck Pending (&gt;30m)
          </span>
          <div className="font-outfit text-2xl font-bold text-gray-900 dark:text-white">
            {gateway?.stuckPendingPayments ?? 0}
          </div>
          <p className="text-[11px] text-gray-400">
            Orders pending without capture
          </p>
        </div>
      </div>

      {/* ── Webhook Events Monitor Table ── */}
      <div className="bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
            Incoming Webhook Event Log
          </h3>
          <span className="text-xs text-gray-400">
            Last Event: {gateway?.lastReceivedAt ? formatDate(gateway.lastReceivedAt) : "None yet"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Received At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading webhook events...
                  </td>
                </tr>
              ) : data?.events?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No webhook events recorded yet. Perform a checkout test to trigger events.
                  </td>
                </tr>
              ) : (
                data?.events?.map((ev: any) => (
                  <tr
                    key={ev.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white font-mono">
                      {ev.type}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                      {ev.eventId}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {formatDate(ev.createdAt)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Pill variant={ev.error ? "missed" : "active"}>
                        {ev.error ? "FAILED" : "PROCESSED"}
                      </Pill>
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 text-[11px]">
                      {ev.error || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPayload(ev.payload)}
                        className="text-[11px] font-semibold text-[#47664A] hover:underline"
                      >
                        Payload
                      </button>
                      <button
                        type="button"
                        disabled={replayingId === ev.id}
                        onClick={() => handleReplay(ev.id)}
                        className="text-[11px] font-semibold text-amber-600 hover:underline disabled:opacity-50"
                      >
                        {replayingId === ev.id ? "Replaying..." : "Replay"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload JSON Inspector Modal */}
      {selectedPayload && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setSelectedPayload(null)}
              className="absolute top-4 right-4 p-1 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <Code className="w-5 h-5 text-[#47664A]" />
              <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">
                Raw Webhook Event Payload
              </h3>
            </div>

            <pre className="max-h-96 overflow-auto p-4 rounded-xl bg-gray-900 text-gray-100 font-mono text-[11px] leading-relaxed">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setSelectedPayload(null)}
                variant="outline"
                className="rounded-xl px-4 py-2 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
