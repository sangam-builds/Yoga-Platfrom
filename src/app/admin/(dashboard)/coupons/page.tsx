"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Ticket, Tag, Calendar, Check, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/UIBlocks";
import { Pill } from "@/components/dashboard/ui/Pill";
import { useI18n } from "@/lib/i18n";

export default function AdminCouponsPage() {
  const { formatDate } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons-list"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to load promo codes");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Coupons & Promo Codes"
        description="Manage promotional campaigns, discount percentages, per-user redemption limits, and plan restrictions."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Coupons" }]}
      />

      <div className="bg-white dark:bg-gray-900 border border-[#E9E2D0] dark:border-gray-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Per-User Limit</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Applicable Plans</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading promo codes...
                  </td>
                </tr>
              ) : data?.coupons?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No promo codes found.
                  </td>
                </tr>
              ) : (
                data?.coupons?.map((coupon: any) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--sage-tint)] text-[var(--primary-sage)]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {coupon.discountType === "PERCENT"
                        ? `${coupon.discountValue}% OFF`
                        : `₹${(coupon.discountValue / 100).toFixed(0)} OFF`}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                      {coupon.redemptionsCount}{" "}
                      {coupon.maxRedemptions ? `/ ${coupon.maxRedemptions}` : "(Unlimited)"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {coupon.perUserLimit} per user
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {formatDate(coupon.validFrom)}
                      {coupon.validTo ? ` to ${formatDate(coupon.validTo)}` : " onwards"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {coupon.applicablePlans.length > 0
                        ? coupon.applicablePlans.join(", ")
                        : "All practice plans"}
                    </td>
                    <td className="py-3.5 px-4">
                      <Pill variant={coupon.isActive ? "active" : "paused"}>
                        {coupon.isActive ? "ACTIVE" : "INACTIVE"}
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
