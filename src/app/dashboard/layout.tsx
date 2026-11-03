import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/dashboard/shared/Toast";
import { AppShell } from "@/components/dashboard/AppShell";

export const metadata: Metadata = {
  title: "Student Dashboard | ZenFlow",
  description: "Personalized Yoga & Wellness Studio Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthUser();

  if (!auth) {
    redirect("/login?next=/dashboard");
  }

  const { dbUser, authUser } = auth;
  const activeSub = dbUser.subscriptions[0];

  // Count bookings today for sidebar badge
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const todayBookingsCount = await prisma.booking.count({
    where: {
      userId: dbUser.id,
      status: "BOOKED",
      session: {
        startsAt: { gte: startOfDay, lt: endOfDay },
      },
    },
  });

  const userData = {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.image || authUser.user_metadata?.avatar_url || null,
    role: dbUser.role,
    hasActivePlan: !!activeSub,
    creditsRemaining: activeSub?.creditsRemaining ?? 5,
    emailVerified: !!dbUser.emailVerified || !!authUser.email_confirmed_at,
    todayBookingsCount,
  };

  return (
    <QueryProvider>
      <I18nProvider
        initialLocale={(dbUser.locale as "en" | "hi" | "pa") || "en"}
        initialTimezone={dbUser.timezone || "Asia/Kolkata"}
      >
        <ToastProvider>
          <AppShell user={userData}>
            {children}
          </AppShell>
        </ToastProvider>
      </I18nProvider>
    </QueryProvider>
  );
}

