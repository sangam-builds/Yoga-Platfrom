"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Check, Users, ShoppingBag, ShieldCheck, Tag } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Pill } from "@/components/dashboard/ui/Pill";
import { useI18n } from "@/lib/i18n";

export default function AdminPlansPage() {
  const { formatCurrency } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-plans-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Plans & Practice Tiers"
        description="Single source of truth for platform pricing, practice commitments, session credit limits, and subscription intervals."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Plans" }]}
      />

      <div className="bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Price (INR)</th>
                <th className="py-3 px-4">Credits</th>
                <th className="py-3 px-4">Subscribers</th>
                <th className="py-3 px-4">Purchases</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    Loading practice tiers...
                  </td>
                </tr>
              ) : (
                data?.plans?.map((plan: any) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                      {plan.slug}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] font-semibold text-gray-500">
                      {plan.type}
                    </td>
                    <td className="py-3.5 px-4 capitalize font-medium text-gray-700 dark:text-gray-300">
                      {plan.interval === "NONE" ? "One-time" : plan.interval.toLowerCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#47664A]">
                      {plan.priceInr === 0 ? "Free" : formatCurrency(plan.priceInr / 100)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {plan.credits === null ? "Unlimited" : `${plan.credits} classes`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {plan.activeSubscribers}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                        {plan.totalPurchases}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Pill variant={plan.isActive ? "active" : "paused"}>
                        {plan.isActive ? "ACTIVE" : "ARCHIVED"}
                      </Pill>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
