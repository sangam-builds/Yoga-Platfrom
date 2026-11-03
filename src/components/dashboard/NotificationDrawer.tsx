"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Check, Bell, Calendar, Award, CreditCard, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  actionUrl?: string | null;
}

export function NotificationDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useQuery<{
    notifications: NotificationItem[];
    unreadCount: number;
  }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
    enabled: isOpen,
    refetchInterval: 60000, // Poll every 60 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/read-all", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  if (!isOpen) return null;

  const notifications = data?.notifications || [];
  const filtered = filter === "unread" ? notifications.filter((n) => !n.readAt) : notifications;

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING_CONFIRMED":
      case "CLASS_REMINDER":
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case "CERTIFICATE_ISSUED":
      case "BADGE_EARNED":
        return <Award className="w-4 h-4 text-amber-500" />;
      case "PAYMENT_SUCCEEDED":
      case "PAYMENT_FAILED":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notification Center"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#233D32] dark:text-[#A7C4B5]" />
            <h2 className="font-serif font-bold text-lg text-gray-900 dark:text-white">Notifications</h2>
            {(data?.unreadCount || 0) > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#6B8F71] text-white">
                {data?.unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#233D32] text-white dark:bg-[#6B8F71]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === "unread"
                  ? "bg-[#233D32] text-white dark:bg-[#6B8F71]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Unread
            </button>
          </div>

          {(data?.unreadCount || 0) > 0 && (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              className="text-[#6B8F71] hover:underline font-medium inline-flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading && (
            <div className="py-12 text-center text-xs text-gray-400">Loading notifications...</div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {filter === "unread" ? "No unread notifications" : "You have no notifications"}
              </p>
              <p className="text-xs text-gray-500">Updates regarding your bookings and sessions will appear here.</p>
            </div>
          )}

          {!isLoading &&
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.readAt) markAsReadMutation.mutate(item.id);
                  if (item.actionUrl) {
                    router.push(item.actionUrl);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                  !item.readAt
                    ? "bg-[#6B8F71]/10 border-[#6B8F71]/30 dark:bg-[#6B8F71]/15"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.title}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.body}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
