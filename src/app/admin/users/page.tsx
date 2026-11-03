import React from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/server";
import { prisma } from "@/lib/prisma";
import { UserRoleManager, ManagedUser } from "@/components/admin/UserRoleManager";
import { UserRole } from "@/lib/rbac/roles";

export const metadata: Metadata = {
  title: "User & Role Management | ZenFlow Admin",
  description: "Role-Based Access Control configuration and user directory",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { dbUser: adminUser } = await requireAdmin();

  let users: ManagedUser[] = [];

  try {
    const rawUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    users = rawUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as UserRole,
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to load users for RBAC management:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E9E2D0]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#233D32]">
            User & Role Management (RBAC)
          </h1>
          <p className="text-xs sm:text-sm text-[#292D2A]/70 font-light pt-1">
            Manage permissions, promote instructors, or grant administrator capabilities.
            All role changes are cryptographically committed to the audit ledger.
          </p>
        </div>
      </div>

      <UserRoleManager
        initialUsers={users}
        currentAdminEmail={adminUser.email}
      />
    </div>
  );
}

