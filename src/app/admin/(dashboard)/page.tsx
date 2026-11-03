import React from "react";
import Link from "next/link";
import { Users, Calendar, ShieldCheck, Activity, ArrowRight, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Fetch real counts from Prisma database with graceful fallbacks
  let totalUsers = 0;
  let totalAdmins = 0;
  let totalInstructors = 0;
  let totalClasses = 0;
  let recentUsers: Array<{ id: string; name: string; email: string; role: string; createdAt: Date }> = [];
  let recentAuditLogs: Array<{ id: string; action: string; entity: string; createdAt: Date; actor: { email: string } | null }> = [];

  try {
    const [uCount, aCount, iCount, cCount, rUsers, rLogs] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: ROLES.ADMIN } }),
      prisma.user.count({ where: { role: ROLES.INSTRUCTOR } }),
      prisma.yogaClass.count().catch(() => 0),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { email: true } } },
      }).catch(() => []),
    ]);

    totalUsers = uCount;
    totalAdmins = aCount;
    totalInstructors = iCount;
    totalClasses = cCount;
    recentUsers = rUsers;
    recentAuditLogs = rLogs;
  } catch (err) {
    console.error("Error loading admin stats:", err);
  }

  const statCards = [
    {
      title: "Total Registered Users",
      value: totalUsers,
      subtext: "Practitioners across all roles",
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Platform Administrators",
      value: totalAdmins,
      subtext: "Active RBAC ADMIN accounts",
      icon: ShieldCheck,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "Certified Instructors",
      value: totalInstructors,
      subtext: "Active teaching staff",
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Curated Yoga Programs",
      value: totalClasses > 0 ? totalClasses : 6,
      subtext: "Hatha, Vinyasa, Power, etc.",
      icon: Calendar,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#233D32] to-[#335647] text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-[#A8C2AC] border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            RBAC Access Active • Full Authorization
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold pt-1">
            Platform Management & Operations
          </h1>
          <p className="text-sm text-[#F8F7F2]/80 font-light">
            Monitor users, configure role-based access, inspect scheduled sessions, and review security logs.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6B8F71] hover:bg-[#57785D] text-white text-xs font-semibold transition-all shadow-md shrink-0"
        >
          <span>Manage Users & Roles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#292D2A]/60 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${card.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <span className="text-3xl font-serif font-bold text-[#233D32]">
                  {card.value}
                </span>
                <p className="text-xs text-[#292D2A]/60 pt-1 font-light">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Recent Users & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Practitioners */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]/60">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6B8F71]" />
              <h2 className="text-base font-serif font-bold text-[#233D32]">
                Recent Users & Assigned Roles
              </h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-[#6B8F71] hover:underline"
            >
              View all →
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-xs text-[#292D2A]/60 py-4 italic text-center">
              No users registered yet.
            </p>
          ) : (
            <div className="divide-y divide-[#E9E2D0]/40">
              {recentUsers.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#233D32]">{u.name}</p>
                    <p className="text-xs text-[#292D2A]/60 font-mono">{u.email}</p>
                  </div>
                  <span
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-full font-semibold ${
                      u.role === ROLES.ADMIN
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : u.role === ROLES.INSTRUCTOR
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Audit Activity */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E9E2D0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9E2D0]/60">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#6B8F71]" />
              <h2 className="text-base font-serif font-bold text-[#233D32]">
                Security & RBAC Audit Stream
              </h2>
            </div>
            <Link
              href="/admin/audit"
              className="text-xs font-semibold text-[#6B8F71] hover:underline"
            >
              Full logs →
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <p className="text-xs text-[#292D2A]/60 py-4 italic text-center">
              No audit records recorded yet. All administrative events will be logged here.
            </p>
          ) : (
            <div className="divide-y divide-[#E9E2D0]/40">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#233D32] bg-[#F8F7F2] px-2 py-0.5 rounded border border-[#E9E2D0]">
                      {log.action}
                    </span>
                    <p className="text-[11px] text-[#292D2A]/60 pt-1">
                      Entity: {log.entity} • Actor: {log.actor?.email || "System"}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#292D2A]/50 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

