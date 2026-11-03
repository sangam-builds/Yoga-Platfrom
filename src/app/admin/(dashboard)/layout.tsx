import React from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/dashboard/shared/Toast";

export const metadata: Metadata = {
  title: "Admin Console | ZenFlow",
  description: "Administrative Management & RBAC Portal for ZenFlow Platform",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforces server-side authentication & ADMIN role
  const { dbUser } = await requireAdmin();

  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[#F8F7F2] flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader
              adminEmail={dbUser.email}
              adminName={dbUser.name}
              role={dbUser.role}
            />

            <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}

