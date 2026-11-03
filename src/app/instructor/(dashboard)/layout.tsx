import React from "react";
import type { Metadata } from "next";
import { requireInstructor } from "@/lib/rbac/instructor";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorHeader } from "@/components/instructor/InstructorHeader";
import { NextSessionBar } from "@/components/instructor/NextSessionBar";
import { InstructorBanners } from "@/components/instructor/InstructorBanners";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/dashboard/shared/Toast";

export const metadata: Metadata = {
  title: "Instructor Portal | ZenFlow",
  description: "Teacher Management & Live Studio Suite for ZenFlow Instructors",
};

export default async function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dbUser, profile } = await requireInstructor();

  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#F8F7F2] flex">
          {/* Sidebar (Desktop & Drawer) */}
          <InstructorSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
            <InstructorHeader
              instructorEmail={dbUser.email}
              instructorName={dbUser.name}
              timezone={profile.timezone}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
              {/* Always-Visible Next Session Bar */}
              <NextSessionBar />

              {/* Dynamic Status Banners (Disputes, MFA, Payout details) */}
              <InstructorBanners />

              {/* Screen Content */}
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}
